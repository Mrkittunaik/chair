function renderHeader(active, query){
  const q = query || "";
  document.getElementById("headerRoot").innerHTML = `
  <header class="site-header">
    <div class="container header-inner">
      <a href="#/" class="logo">PRABOT.</a>
      <nav class="main-nav" id="mainNav">
        ${NAV.map(n=>`<a href="${n.href}" class="${active===n.key?'active':''}">${n.label}</a>`).join("")}
      </nav>
      <div class="nav-backdrop" id="navBackdrop"></div>
      <form class="header-search" id="headerSearchForm" role="search">
        <span class="s-icon">${ICONS.search}</span>
        <input type="search" id="headerSearchInput" value="${escapeHtml(q)}" placeholder="Search sofas, desks, beds…" aria-label="Search furniture">
      </form>
      <div class="header-actions">
        <div class="icon-group">
          <a href="#/wishlist" class="icon-btn" aria-label="Wishlist">${ICONS.heart}<span class="badge" id="wishBadge" hidden>0</span></a>
          <a href="#/cart" class="icon-btn" aria-label="Cart">${ICONS.bag}<span class="badge" id="cartBadge" hidden>0</span></a>
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
  nav.addEventListener("click", e=>{ if(e.target.tagName==="A") closeMenu(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeMenu(); });

  ["headerSearchForm","mobileSearchForm"].forEach(id=>{
    const form = document.getElementById(id);
    form.addEventListener("submit", e=>{
      e.preventDefault();
      const val = form.querySelector("input").value.trim();
      location.hash = "#/search" + (val ? "?q="+encodeURIComponent(val) : "");
    });
  });
  syncBadges();
}

function renderFooter(){
  document.getElementById("footerRoot").innerHTML = `
  <footer class="site-footer">
    <div class="container" style="padding:0;">
      <div class="footer-grid">
        <div>
          <div class="logo">PRABOT.</div>
          <p>Furniture made for the way people actually live and work — comfortable, durable, and built to be used every day.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="#/shop">All furniture</a></li>
            <li><a href="#/shop?cat=sofas">Sofas</a></li>
            <li><a href="#/shop?cat=office">Office</a></li>
            <li><a href="#/shop?cat=bedroom">Bedroom</a></li>
            <li><a href="#/shop?cat=gaming">Gaming</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#/about">About us</a></li>
            <li><a href="#/contact">Contact</a></li>
            <li><a href="#/search">Search</a></li>
            <li><a href="#/wishlist">Wishlist</a></li>
            <li><a href="#/cart">Cart</a></li>
          </ul>
        </div>
        <div>
          <h4>Get delivery updates and new arrivals</h4>
          <form class="news-row" id="newsForm">
            <input type="email" placeholder="you@email.com" aria-label="Email address" required>
            <button class="btn btn-sm" type="submit">Subscribe</button>
          </form>
          <p style="margin-top:10px;">One email a month. Unsubscribe anytime.</p>
        </div>
      </div>
      <div class="footer-base">
        <span>© ${new Date().getFullYear()} ${escapeHtml(AdminStore.getSettings().siteName)}</span>
        <span>Free delivery and installation on orders above ${formatINR(AdminStore.getSettings().freeShipThreshold)} · <a href="#/admin" style="opacity:.45;font-size:11px;">Admin</a></span>
      </div>
    </div>
  </footer>`;
  document.getElementById("newsForm").addEventListener("submit", e=>{
    e.preventDefault(); e.target.reset(); showToast("Subscribed");
  });
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
function productCardHTML(p){
  const wished = Store.inWish(p.id);
  return `
  <article class="product-card">
    <div class="pc-media img-wrap shimmer">
      <a href="#/product/${p.id}"><img src="${p.img}" ${fb(p.group)} alt="${escapeHtml(p.name)}" loading="lazy"></a>
      <button class="pc-wish ${wished?'on':''}" data-wish="${p.id}" aria-label="${wished?'Remove from wishlist':'Save to wishlist'}">${wished?ICONS.heartFill:ICONS.heart}</button>
    </div>
    <div class="pc-body">
      <div class="pc-cat">${p.category}</div>
      <a href="#/product/${p.id}" class="pc-name">${escapeHtml(p.name)}</a>
      <div class="pc-meta">
        <span class="pc-price">${formatINR(p.price)}</span>
        <span class="pc-rating">${ICONS.star}${p.rating}</span>
      </div>
      <div class="pc-actions"><button class="btn btn-primary btn-sm btn-block" data-add="${p.id}">Add to cart</button></div>
    </div>
  </article>`;
}

function renderProductGrid(el, list){
  if(!el) return;
  el.innerHTML = list.map(productCardHTML).join("");
}

document.addEventListener("click", e=>{
  const add = e.target.closest("[data-add]");
  if(add){ Store.addToCart(add.dataset.add,1); showToast("Added to cart"); return; }
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
