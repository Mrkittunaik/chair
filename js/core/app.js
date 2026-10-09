const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealObserver;
function setupReveals(){
  if(reduceMotion) return;
  if(revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach((en,i)=>{
      if(en.isIntersecting){
        const el = en.target;
        el.style.transitionDelay = Math.min(parseInt(el.dataset.i||0,10)*55, 280) + "ms";
        el.classList.add("in");
        revealObserver.unobserve(el);
      }
    });
  }, { rootMargin:"0px 0px -60px 0px", threshold:.08 });
  document.querySelectorAll("#app .section-head, #app .product-card, #app .collection-card, #app .cat-card, #app .value-card, #app .promo, #app .about-grid > *, #app .filters, #app .empty-state").forEach(el=>{
    if(el.classList.contains("in")) return;
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}
function groupStagger(){
  document.querySelectorAll("#app .product-grid, #app .grid-collections, #app .cat-rail, #app .value-grid").forEach(grid=>{
    [...grid.children].forEach((c,i)=>{ c.dataset.i = i % 8; });
  });
}
window.addEventListener("scroll", ()=>{
  const h = document.querySelector(".site-header");
  if(h) h.classList.toggle("scrolled", window.scrollY > 8);
}, { passive:true });

/* ---------------- Router (History API, real URLs) ---------------- */
function parseRoute(){
  const path = (location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
  const parts = path.split("/").filter(Boolean);
  const params = {};
  new URLSearchParams(location.search).forEach((v,k)=>params[k]=v);
  const first = parts[0] || "home";
  if(first==="product") return { route:"product", slug:parts[1]||"", id:(productFromPath(parts[1])||{}).id || "", params, path };
  const app = { shop:1, search:1, cart:1, checkout:1, wishlist:1, about:1, contact:1 };
  if(app[first] && parts.length===1) return { route:first, id:"", params, path };
  if(path==="/bulk-furniture-orders" || path==="/bulk") return { route:"bulk", id:"", params, path };
  if(path==="/") return { route:"home", id:"", params, path };
  return { route:"page", id:"", params, path };
}
const parseHash = parseRoute;   /* old name still used by a few views */

/* Which top-nav item is highlighted */
function navKeyFor(route, params, path){
  if(route==="shop") return params.cat==="gaming" ? "gaming" : "shop";
  if(route==="page"){
    if(/^\/(custom-)/.test(path)) return "custom";
    if(/^\/(school|college|institutional)/.test(path)) return "edu";
    if(/^\/(office|ergonomic|executive)/.test(path)) return "office";
  }
  if(route==="product"){ const p = productFromPath(path.split("/")[2]); return p && p.group==="office" ? "office" : "shop"; }
  return route;
}

/* ---- SEO library (ES modules, loaded on demand; the server already rendered head + body for the first view) ---- */
let seoReady = null;
function seoLoad(){
  if(!seoReady) seoReady = Promise.all([import("/seo/lib.js"), import("/seo/site.js"), import("/seo/pages.js")]).then(([lib, site, pages])=>{
    window.SeoLib = Object.assign({}, lib, { SITE:site.default, PAGES:pages.default });
    renderFooter();               /* footer can now show social / maps links from seo/site.js */
    return window.SeoLib;
  }).catch(()=>null);
  return seoReady;
}
function seoCtx(){
  const L = window.SeoLib;
  return { site:L.mergeSite(L.SITE, CATALOG && CATALOG.settings), pages:L.PAGES, products:allProducts(), settings:(CATALOG && CATALOG.settings) || {}, groupLabels:allCategoryLabels() };
}
function seoRefresh(){
  if(!window.SeoLib) return;
  const ctx = seoCtx(), r = SeoLib.resolve(location.pathname, location.search, ctx);
  if(r.redirect && r.redirect !== location.pathname+location.search){ history.replaceState(null,"",r.redirect); return render(); }
  SeoLib.applyHeadDOM(SeoLib.metaFor(r, ctx), ctx.site);
}

let firstRender = true;
function finishRender(route, id, params, active, after){
  renderHeader(active, route==="search" ? (params.q||"") : "");
  if(after) after();
  renderFooter();
  groupStagger();
  setupReveals();
  syncHeaderHeight();
  if(!firstRender) window.scrollTo(0,0);
  if(typeof Track!=="undefined") Track.onRoute(route, id, params);
  const wasFirst = firstRender; firstRender = false;
  const app = document.getElementById("app");
  if(!wasFirst) app.removeAttribute("data-ssr");
  seoLoad().then(()=>{ if(!wasFirst || !app.dataset.ssr) seoRefresh(); });
}

function render(){
  document.body.classList.remove("nav-locked");
  const { route, id, params, path } = parseRoute();
  const app = document.getElementById("app");
  const active = navKeyFor(route, params, path);

  if(route==="page"){
    const ssr = firstRender && app.dataset.ssr === path && app.querySelector("h1");
    if(ssr){ finishRender(route, id, params, active, ()=>afterSeoPage(path)); return; }
    app.innerHTML = '<div class="seo-loading" style="min-height:60vh"></div>';
    seoLoad().then(L=>{
      if(parseRoute().path !== path) return;
      if(!L){   /* seo/ modules missing or failed to load: never leave a blank page */
        app.innerHTML = fallbackPageHTML(path);
        finishRender(route, id, params, active, null);
        return;
      }
      const ctx = seoCtx(), r = L.resolve(path, "", ctx);
      if(r.redirect){ history.replaceState(null,"",r.redirect); return render(); }
      app.innerHTML = (r.kind==="page") ? L.pageHTML(r, ctx) : notFound();
      finishRender(route, id, params, active, ()=>afterSeoPage(path));
    });
    return;
  }

  let html = "", after = null;
  switch(route){
    case "home": html = viewHome(); after = afterHome; break;
    case "shop": html = viewShop(params); after = ()=>afterShop(params); break;
    case "search": html = viewSearch(params); after = ()=>afterSearch(params); break;
    case "product": html = viewProduct(id); after = ()=>afterProduct(id); break;
    case "cart": html = viewCart(); after = afterCart; break;
    case "checkout": html = viewCheckout(); after = afterCheckout; break;
    case "bulk": html = viewBulk(); after = afterBulk; break;
    case "wishlist": html = viewWishlist(); break;
    case "about": html = viewAbout(); break;
    case "contact": html = viewContact(); after = afterContact; break;
    default: html = notFound();
  }
  app.innerHTML = html;
  finishRender(route, id, params, active, after);
}

/* landing / guide / legal pages: swap the static product links for the interactive product cards */
function afterSeoPage(path){
  seoLoad().then(L=>{
    if(!L) return;
    const pg = L.PAGES[path]; if(!pg || !pg.match) return;
    const grid = document.querySelector("[data-seo-grid]"); if(!grid) return;
    const list = L.filterProducts(allProducts(), pg.match).slice(0,8);
    if(list.length){ renderProductGrid(grid, list); groupStagger(); setupReveals(); }
  });
}

/* real links: same-origin clicks use the History API instead of a full reload */
document.addEventListener("click", e=>{
  if(e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href]");
  if(!a || (a.getAttribute("href")||"").startsWith("#") || a.target==="_blank" || a.hasAttribute("download") || a.hasAttribute("data-wa")) return;
  const u = new URL(a.href, location.href);
  if(u.origin !== location.origin || /\.(html|xml|txt|png|jpe?g|webp|pdf)$/i.test(u.pathname) || u.pathname.startsWith("/api/")) return;
  e.preventDefault();
  navigate(u.pathname + u.search);
});
window.addEventListener("popstate", render);

/* Old links like https://adilfurnitures.com/#/product/p01 (shared on WhatsApp etc.) -> real URLs */
(function legacyHash(){
  const h = location.hash; if(!/^#\//.test(h)) return;
  let [p, q] = h.slice(1).split("?"); p = p.replace(/\/+$/,"") || "/";
  const params = new URLSearchParams(q||"");
  if(p==="/bulk") p = "/bulk-furniture-orders";
  if(p==="/shop" && params.get("cat")==="office" && [...params.keys()].length===1){ p = "/office-furniture"; q = ""; }
  history.replaceState(null,"", p + (q ? "?"+q : ""));
})();

/* ---- Keep --header-total in sync with the real rendered header ----
   The mobile layout stacks a search bar under the header row, and its
   height changes with font-size / wrapping. Measuring beats hardcoding. */
function syncHeaderHeight(){
  const h = document.querySelector(".site-header");
  if(!h) return;
  const px = Math.round(h.getBoundingClientRect().height);
  if(px > 0) document.documentElement.style.setProperty("--header-total", px + "px");
}
if(window.ResizeObserver){
  const ro = new ResizeObserver(syncHeaderHeight);
  const hr = document.getElementById("headerRoot");
  if(hr) ro.observe(hr);
}
window.addEventListener("resize", syncHeaderHeight);
window.addEventListener("orientationchange", ()=>setTimeout(syncHeaderHeight,150));
if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

render();
syncHeaderHeight();
Track.init();      /* start visitor tracking after every script is loaded */
