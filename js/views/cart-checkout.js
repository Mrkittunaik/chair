function viewCart(){
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Cart</p>
      <h1 class="page-title">Your cart</h1>
    </div>
  </section>
  <section class="section"><div class="container" id="cartArea"></div></section>`;
}
function afterCart(){
  const area = document.getElementById("cartArea");
  function draw(){
    const cart = Store.getCart();
    const ids = Object.keys(cart);
    if(!ids.length){
      area.innerHTML = `<div class="empty-state"><h3>Your cart is empty</h3><p>Add a piece from the catalogue and it will show up here with delivery and total.</p><a href="#/shop" class="btn btn-primary">Browse furniture</a></div>`;
      return;
    }
    const sub = Store.cartTotal();
    const settings = AdminStore.getSettings();
    const ship = sub >= settings.freeShipThreshold ? 0 : settings.shipCost;
    area.innerHTML = `
      <div class="cart-layout">
        <div class="cart-list">
          ${ids.map(id=>{
            const p = findProduct(id); if(!p) return "";
            return `
            <div class="cart-row">
              <a href="#/product/${p.id}"><img src="${p.img}" ${fb(p.group)} alt="${escapeHtml(p.name)}"></a>
              <div>
                <a href="#/product/${p.id}" class="nm">${escapeHtml(p.name)}</a>
                <div class="ct">${p.category} · ${p.color}</div>
                <div class="qty" style="margin-top:10px;">
                  <button data-dec="${p.id}" aria-label="Decrease quantity">−</button><span>${cart[id]}</span><button data-inc="${p.id}" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div class="rt">
                <span class="pc-price">${formatINR(p.price*cart[id])}</span>
                <button class="link-btn" data-del="${p.id}">Remove</button>
              </div>
            </div>`;
          }).join("")}
        </div>
        <aside class="summary">
          <h3>Order summary</h3>
          <div class="sum-row"><span>Subtotal</span><span>${formatINR(sub)}</span></div>
          <div class="sum-row"><span>Delivery and install</span><span>${ship? formatINR(ship) : "Free"}</span></div>
          <div class="sum-total"><span>Total</span><span>${formatINR(sub+ship)}</span></div>
          <a href="#/checkout" class="btn btn-wa btn-block" style="margin-top:18px;" id="checkout">${WA_ICON}<span>Place order on WhatsApp</span></a>
          <a href="#" class="btn btn-ghost btn-block" style="margin-top:10px;" data-wa="bulk">Need bulk quantity? Ask on WhatsApp</a>
          <a href="#/shop" class="btn btn-ghost btn-block" style="margin-top:10px;">Keep shopping</a>
          ${ship? `<p style="font-size:12.5px;color:var(--ink-soft);margin-top:12px;">Add ${formatINR(settings.freeShipThreshold-sub)} more for free delivery.</p>`:""}
        </aside>
      </div>`;
    area.querySelectorAll("[data-inc]").forEach(b=>b.addEventListener("click",()=>{ Store.setQty(b.dataset.inc, Store.getCart()[b.dataset.inc]+1); draw(); }));
    area.querySelectorAll("[data-dec]").forEach(b=>b.addEventListener("click",()=>{ Store.setQty(b.dataset.dec, Store.getCart()[b.dataset.dec]-1); draw(); }));
    area.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{ Store.removeFromCart(b.dataset.del); showToast("Removed"); draw(); }));
  }
  draw();
}

/* ---------------- View: Checkout ---------------- */
function viewCheckout(){
  const cart = Store.getCart();
  const ids = Object.keys(cart);
  if(!ids.length){
    return `<section class="section"><div class="container"><div class="empty-state">
      <h3>Your cart is empty</h3><p>Add something before checking out.</p>
      <a href="#/shop" class="btn btn-primary">Browse furniture</a></div></div></section>`;
  }
  const settings = AdminStore.getSettings();
  const sub = Store.cartTotal();
  const ship = sub >= settings.freeShipThreshold ? 0 : settings.shipCost;
  const items = ids.map(id=>findProduct(id)).filter(Boolean);
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / <a href="#/cart">Cart</a> / Checkout</p>
      <h1 class="page-title">Checkout</h1>
      <p class="page-desc">Enter your delivery details. Your full order opens in WhatsApp, just tap Send.</p>
    </div>
  </section>
  <section class="section">
    <div class="container cart-layout">
      <div class="form-card">
        <form id="checkoutForm">
          <div class="field"><label for="coName">Full name</label><input id="coName" required></div>
          <div class="field"><label for="coPhone">Phone</label><input id="coPhone" type="tel" required></div>
          <div class="field"><label for="coEmail">Email (optional)</label><input id="coEmail" type="email"></div>
          <div class="field"><label for="coAddress">Delivery address</label><textarea id="coAddress" required></textarea></div>
          <div class="field"><label for="coNotes">Order notes (optional)</label><textarea id="coNotes"></textarea></div>
          <button class="btn btn-wa btn-block" type="submit">${WA_ICON}<span>Send order on WhatsApp — ${formatINR(sub+ship)}</span></button>
          <p style="font-size:12.5px;color:var(--ink-soft);margin-top:10px;">Your order details open in WhatsApp to ${WA_DISPLAY}. Tap Send there to confirm.</p>
        </form>
      </div>
      <aside class="summary">
        <h3>Order summary</h3>
        ${items.map(p=>`<div class="sum-row"><span>${escapeHtml(p.name)} × ${cart[p.id]}</span><span>${formatINR(p.price*cart[p.id])}</span></div>`).join("")}
        <div class="sum-row"><span>Subtotal</span><span>${formatINR(sub)}</span></div>
        <div class="sum-row"><span>Delivery and install</span><span>${ship? formatINR(ship) : "Free"}</span></div>
        <div class="sum-total"><span>Total</span><span>${formatINR(sub+ship)}</span></div>
      </aside>
    </div>
  </section>`;
}
function afterCheckout(){
  const form = document.getElementById("checkoutForm");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const customer = {
      name: document.getElementById("coName").value.trim(),
      phone: document.getElementById("coPhone").value.trim(),
      email: document.getElementById("coEmail").value.trim(),
      address: document.getElementById("coAddress").value.trim(),
      notes: document.getElementById("coNotes").value.trim()
    };
    const msg = waCartMsg(customer);
    Store.setCart({});
    waOpen(msg);
    showToast("Opening WhatsApp…");
    location.hash = "#/shop";
  });
}

/* ---------------- View: Wishlist ---------------- */
