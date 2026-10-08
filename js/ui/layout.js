function renderHeader(active, query){
  const q = query || "";
  document.getElementById("headerRoot").innerHTML = `
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo" aria-label="Adil Furnitures home"><img class="logo-img" src="assets/collections/logo/adil-furnitures-logo.png" alt="Adil Furnitures"></a>
      <nav class="main-nav" id="mainNav">
        ${NAV.map(n=> n.wa
          ? `<a href="${waLink(n.wa==='bulk'?waBulkMsg():waCustomMsg())}" data-wa="${n.wa}" class="nav-wa-link" target="_blank" rel="noopener">${n.label}</a>`
          : `<a href="${n.href}" class="${(n.cls||'')+' '+(active===n.key?'active':'')}"${active===n.key?' aria-current="page"':''}>${n.label}</a>`
        ).join("")}
        <a href="${waLink('Hello '+WA_BRAND+', I have a question.')}" data-wa="general" class="btn btn-wa nav-cta" target="_blank" rel="noopener">${WA_ICON}<span>Chat on WhatsApp</span></a>
      </nav>
      <div class="nav-backdrop" id="navBackdrop"></div>
      <form class="header-search" id="headerSearchForm" role="search">
        <span class="s-icon">${ICONS.search}</span>
        <input type="search" id="headerSearchInput" value="${escapeHtml(q)}" placeholder="Search chairs, tables, desks…" aria-label="Search furniture">
      </form>
      <div class="header-actions">
        <a href="${waLink('Hello '+WA_BRAND+', I have a question.')}" data-wa="general" class="wa-head" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${WA_ICON}<span>WhatsApp</span></a>
        <div class="icon-group">
          <a href="/wishlist" class="icon-btn" aria-label="Wishlist">${ICONS.heart}<span class="badge" id="wishBadge" hidden>0</span></a>
          <a href="/cart" class="icon-btn" aria-label="Cart">${ICONS.bag}<span class="badge" id="cartBadge" hidden>0</span></a>
        </div>
        <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Menu" aria-expanded="false">${ICONS.menu}</button>
      </div>
    </div>
    <form class="mobile-search" id="mobileSearchForm" role="search">
      <div class="header-search" style="display:block;max-width:none;">
        <span class="s-icon">${ICONS.search}</span>
        <input type="search" id="mobileSearchInput" value="${escapeHtml(q)}" placeholder="Search furniture…" aria-label="Search furniture">
      </div>
    </form>
  </header>`;

  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("menuToggle");
  const backdrop = document.getElementById("navBackdrop");
  function openMenu(){
    nav.classList.add("open");
    backdrop.classList.add("show");
    document.body.classList.add("nav-locked");
    toggle.setAttribute("aria-expanded","true");
  }
  function closeMenu(){
    nav.classList.remove("open");
    backdrop.classList.remove("show");
    document.body.classList.remove("nav-locked");
    toggle.setAttribute("aria-expanded","false");
  }
  toggle.addEventListener("click", ()=>{
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });
  backdrop.addEventListener("click", closeMenu);
  nav.addEventListener("click", e=>{ if(e.target.closest("a")) closeMenu(); });
  window.__closeMenu = closeMenu;
  if(!window.__navKeyBound){
    window.__navKeyBound = true;
    document.addEventListener("keydown", e=>{ if(e.key==="Escape" && window.__closeMenu) window.__closeMenu(); });
    window.addEventListener("resize", ()=>{ if(window.innerWidth>900 && window.__closeMenu) window.__closeMenu(); });
  }

  ["headerSearchForm","mobileSearchForm"].forEach(id=>{
    const form = document.getElementById(id);
    form.addEventListener("submit", e=>{
      e.preventDefault();
      const val = form.querySelector("input").value.trim();
      navigate("/search" + (val ? "?q="+encodeURIComponent(val) : ""));
    });
  });
  syncBadges();
}

function footerSocial(){
  const st = AdminStore.getSettings(), L = window.SeoLib;
  const merged = Object.assign({}, L ? L.SITE.social : {}, Object.fromEntries(Object.entries(st.social||{}).filter(([,v])=>/^https:\/\//.test(v||""))));
  const names = { instagram:"Instagram", facebook:"Facebook", youtube:"YouTube", linkedin:"LinkedIn" };
  return Object.keys(names).filter(k=>/^https:\/\//.test(merged[k]||"")).map(k=>`<li><a href="${escapeHtml(merged[k])}" target="_blank" rel="noopener me">${names[k]}</a></li>`).join("");
}
function footerMaps(){
  const st = AdminStore.getSettings(), L = window.SeoLib;
  const u = (st.mapsUrl && /^https:\/\//.test(st.mapsUrl) ? st.mapsUrl : "") || (L ? L.SITE.mapsUrl : "");
  return /^https:\/\//.test(u||"") ? `<li><a href="${escapeHtml(u)}" target="_blank" rel="noopener">View on Google Maps</a></li>` : "";
}
function renderFooter(){
  const st = AdminStore.getSettings(), social = footerSocial();
  document.getElementById("footerRoot").innerHTML = `
  <footer class="site-footer">
    <div class="container" style="padding:0;">
      <div class="footer-grid footer-grid-5">
        <div>
          <a href="/" class="logo" aria-label="Adil Furnitures home"><img class="logo-img" src="/assets/collections/logo/adil-furnitures-logo-light.png" alt="Adil Furnitures" width="160" height="48"></a>
          <p>Quality office, school and college furniture at competitive prices. Custom chairs and tables. Based in Hyderabad, serving customers across India.</p>
          <p style="margin-top:10px;">${escapeHtml(st.address)}</p>
          <p style="margin-top:10px;"><a href="${waLink('Hello '+WA_BRAND+', I have a question.')}" data-wa="general" target="_blank" rel="noopener" style="font-weight:700;">WhatsApp: ${WA_DISPLAY}</a></p>
        </div>
        <div>
          <h4>Office furniture</h4>
          <ul>
            <li><a href="/office-furniture">Office furniture</a></li>
            <li><a href="/office-chairs">Office chairs</a></li>
            <li><a href="/ergonomic-chairs">Ergonomic chairs</a></li>
            <li><a href="/executive-chairs">Executive chairs</a></li>
            <li><a href="/office-tables">Office tables</a></li>
          </ul>
        </div>
        <div>
          <h4>Custom &amp; institutional</h4>
          <ul>
            <li><a href="/custom-office-furniture">Custom furniture</a></li>
            <li><a href="/school-furniture">School furniture</a></li>
            <li><a href="/college-furniture">College furniture</a></li>
            <li><a href="/institutional-furniture">Institutional furniture</a></li>
            <li><a href="/bulk-furniture-orders">Bulk orders</a></li>
          </ul>
        </div>
        <div>
          <h4>Locations</h4>
          <ul>
            <li><a href="/office-furniture-hyderabad">Office furniture in Hyderabad</a></li>
            <li><a href="/india-delivery">Delivery across India</a></li>
            ${footerMaps()}
          </ul>
          <h4 style="margin-top:18px;">Company</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/guides">Buying guides</a></li>
            <li><a href="/shop">Shop all</a></li>
          </ul>
        </div>
        <div>
          <h4>Get a quote</h4>
          <p><a href="/bulk-furniture-orders" class="btn btn-primary btn-sm">Request a Quote</a></p>
          ${social ? `<h4 style="margin-top:18px;">Follow us</h4><ul>${social}</ul>` : ""}
        </div>
      </div>
      <div class="footer-base">
        <span>© ${new Date().getFullYear()} ${escapeHtml(st.siteName)}${st.footerText?" · "+escapeHtml(st.footerText):""}</span>
        <span class="footer-legal"><a href="/shipping-delivery">Shipping &amp; Delivery</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms">Terms</a></span>
      </div>
    </div>
  </footer>`;
  if(!document.getElementById("waFloat")){
    const f = document.createElement("a");
    f.id = "waFloat"; f.className = "wa-float";
    f.href = waLink("Hello "+WA_BRAND+", I have a question.");
    f.target = "_blank"; f.rel = "noopener"; f.setAttribute("data-wa","general");
    f.setAttribute("aria-label","Chat on WhatsApp");
    f.innerHTML = WA_ICON;
    document.body.appendChild(f);
  }
}

function syncBadges(){
  const c = Store.cartCount(), w = Store.getWish().length;
  const cb = document.getElementById("cartBadge"), wb = document.getElementById("wishBadge");
  if(cb){ cb.hidden = c===0; cb.textContent = c; }
  if(wb){ wb.hidden = w===0; wb.textContent = w; }
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), 1800);
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

/* ---------------- Product card ---------------- */
function stockBadge(p){
  return p.stockStatus==="OUT_OF_STOCK" ? `<span class="badge-stock out">Out of stock</span>`
    : p.stockStatus==="LOW_STOCK" ? `<span class="badge-stock low">Few left</span>` : "";
}
function priceHTML(p){
  return `<span class="pc-price">${formatINR(p.price)}</span>` + (p.compareAtPrice>p.price ? ` <s class="pc-was">${formatINR(p.compareAtPrice)}</s>` : "");
}
function productCardHTML(p){
  const wished = Store.inWish(p.id);
  const out = isOut(p);
  return `
  <article class="product-card${out?" is-out":""}">
    <div class="pc-media img-wrap shimmer">
      <a href="${productPath(p)}"><img ${imgAttrs(p)} ${fb(p.group)} alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"></a>
      ${stockBadge(p)}${p.discount>0 && !out ? `<span class="badge-off">-${p.discount}%</span>` : ""}
      <button class="pc-wish ${wished?'on':''}" data-wish="${p.id}" aria-label="${wished?'Remove from wishlist':'Save to wishlist'}">${wished?ICONS.heartFill:ICONS.heart}</button>
    </div>
    <div class="pc-body">
      <div class="pc-cat">${p.category}</div>
      <a href="${productPath(p)}" class="pc-name">${escapeHtml(p.name)}</a>
      <div class="pc-meta">
        <span>${priceHTML(p)}</span>
        <span class="pc-rating">${ICONS.star}${p.rating}</span>
      </div>
      <div class="pc-actions">
        ${out ? `<button class="btn btn-secondary btn-sm" disabled>Out of stock</button>` : `<button class="btn btn-primary btn-sm" data-add="${p.id}">Add to cart</button>`}
        <button class="btn btn-wa btn-sm pc-wa" data-wa="product" data-pid="${p.id}" data-qty="1" aria-label="${out?"Ask availability":"Enquire"} on WhatsApp">${WA_ICON}</button>
      </div>
    </div>
  </article>`;
}

function renderProductGrid(el, list){
  if(!el) return;
  el.innerHTML = list.map(productCardHTML).join("");
}

document.addEventListener("click", e=>{
  const add = e.target.closest("[data-add]");
  if(add){ if(Store.addToCart(add.dataset.add,1)) showToast("Added to cart"); return; }
  const wish = e.target.closest("[data-wish]");
  if(wish){
    const on = Store.toggleWish(wish.dataset.wish);
    wish.classList.toggle("on", on);
    wish.innerHTML = on ? ICONS.heartFill : ICONS.heart;
    wish.classList.remove("pop"); void wish.offsetWidth; wish.classList.add("pop");
    showToast(on ? "Saved to wishlist" : "Removed from wishlist");
    if(parseHash().route === "wishlist") render();
  }
});

/* ---------------- Search engine ---------------- */
