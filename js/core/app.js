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

/* ---------------- Router ---------------- */
function parseHash(){
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, qs] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = {};
  new URLSearchParams(qs||"").forEach((v,k)=>params[k]=v);
  return { route: parts[0] || "home", id: parts[1] || "", params };
}

function render(){
  document.body.classList.remove("nav-locked");
  const { route, id, params } = parseHash();
  const app = document.getElementById("app");
  let active = route, html = "", after = null;

  switch(route){
    case "home": html = viewHome(); after = afterHome; break;
    case "shop":
      html = viewShop(params); after = ()=>afterShop(params);
      active = params.cat === "office" ? "office" : params.cat === "gaming" ? "gaming" : "shop";
      break;
    case "search": html = viewSearch(params); after = ()=>afterSearch(params); break;
    case "product": html = viewProduct(id); after = ()=>afterProduct(id); break;
    case "cart": html = viewCart(); after = afterCart; break;
    case "checkout": html = viewCheckout(); after = afterCheckout; break;
    case "order-confirmed": html = viewOrderConfirmed(id); break;
    case "wishlist": html = viewWishlist(); break;
    case "about": html = viewAbout(); break;
    case "contact": html = viewContact(); after = afterContact; break;
    case "admin":
      if(id === "panel" && AdminStore.isLoggedIn()){ html = viewAdminPanel(params); after = afterAdminPanel; }
      else { html = viewAdminLogin(); after = afterAdminLogin; }
      break;
    default: html = notFound();
  }

  renderHeader(active, route==="search" ? (params.q||"") : "");
  app.innerHTML = html;
  if(after) after();
  renderFooter();
  groupStagger();
  setupReveals();
  syncHeaderHeight();
  window.scrollTo(0,0);
}

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

window.addEventListener("hashchange", render);
render();
syncHeaderHeight();
