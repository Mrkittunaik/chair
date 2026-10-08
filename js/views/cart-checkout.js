/* delivery + installation (server re-calculates the real totals when the enquiry is saved) */
function cartCharges(sub){
  const st = AdminStore.getSettings();
  return (sub >= st.freeShipThreshold ? 0 : st.shipCost) + (st.installCharge||0);
}
function viewCart(){
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / Cart</p>
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
      area.innerHTML = `<div class="empty-state"><h3>Your cart is empty</h3><p>Add a piece from the catalogue and it will show up here with delivery and total.</p><a href="/shop" class="btn btn-primary">Browse furniture</a></div>`;
      return;
    }
    const sub = Store.cartTotal();
    const settings = AdminStore.getSettings();
    const ship = sub ? cartCharges(sub) : 0;
    area.innerHTML = `
      <div class="cart-layout">
        <div class="cart-list">
          ${ids.map(id=>{
            const p = findProduct(id); if(!p) return "";
            return `
            <div class="cart-row">
              <a href="${productPath(p)}"><img src="${p.img}" ${fb(p.group)} alt="${escapeHtml(p.name)}"></a>
              <div>
                <a href="${productPath(p)}" class="nm">${escapeHtml(p.name)}</a>
                <div class="ct">${p.category} · ${p.color}</div>
                ${isOut(p)?`<div class="stock-note out" style="margin-top:6px;">Out of stock — remove it to continue</div>`:""}
                <div class="qty" style="margin-top:10px;">
                  <button data-dec="${p.id}" aria-label="Decrease quantity">−</button><span>${cart[id]}</span><button data-inc="${p.id}" aria-label="Increase quantity" ${isOut(p)?"disabled":""}>+</button>
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
          <a href="/checkout" class="btn btn-wa btn-block" style="margin-top:18px;" id="checkout">${WA_ICON}<span>Checkout</span></a>
          <a href="#" class="btn btn-ghost btn-block" style="margin-top:10px;" data-wa="bulk">Need bulk quantity? Ask on WhatsApp</a>
          <a href="/shop" class="btn btn-ghost btn-block" style="margin-top:10px;">Keep shopping</a>
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
      <a href="/shop" class="btn btn-primary">Browse furniture</a></div></div></section>`;
  }
  const settings = AdminStore.getSettings();
  const sub = Store.cartTotal();
  const ship = sub ? cartCharges(sub) : 0;
  const items = ids.map(id=>findProduct(id)).filter(Boolean);
  const dr = Track.draft(), v = k => escapeHtml(dr[k]||"");
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / <a href="/cart">Cart</a> / Checkout</p>
      <h1 class="page-title">Checkout</h1>
      <p class="page-desc">Enter your delivery details. Your full order opens in WhatsApp, just tap Send.</p>
    </div>
  </section>
  <section class="section">
    <div class="container cart-layout">
      <div class="form-card">
        <form id="checkoutForm">
          <div class="field"><label for="coName">Full name</label><input id="coName" autocomplete="name" required value="${v("name")}"></div>
          <div class="field"><label for="coPhone">Phone</label><input id="coPhone" type="tel" inputmode="tel" autocomplete="tel" required value="${v("phone")}"></div>
          <div class="field"><label for="coEmail">Email (optional)</label><input id="coEmail" type="email" autocomplete="email" value="${v("email")}"></div>
          <div class="field"><label for="coAddress">Delivery address</label><textarea id="coAddress" autocomplete="street-address" required>${v("address")}</textarea></div>
          <div class="field"><label for="coNotes">Order notes (optional)</label><textarea id="coNotes">${v("notes")}</textarea></div>
          <button class="btn btn-wa btn-block" type="submit">${WA_ICON}<span>Send Order on WhatsApp — ${formatINR(sub+ship)}</span></button>
          <p style="font-size:12.5px;color:var(--ink-soft);margin-top:10px;">Your order details open in WhatsApp to ${WA_DISPLAY}. Tap Send there to confirm.</p>
        </form>
      </div>
      <aside class="summary">
        <h3>Order summary</h3>
        <details class="sum-items" open><summary>${items.length} item${items.length>1?"s":""}</summary>
        ${items.map(p=>`<div class="sum-row"><span>${escapeHtml(p.name)} × ${cart[p.id]}${isOut(p)?' <em class="stock-note out">(out of stock)</em>':""}</span><span>${formatINR(p.price*cart[p.id])}</span></div>`).join("")}</details>
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
  const map = { coName:"name", coPhone:"phone", coEmail:"email", coAddress:"address", coNotes:"notes" };
  const val = id => document.getElementById(id).value.trim();
  /* auto-save (debounced inside Track.saveProfile - never one request per keystroke) */
  Object.keys(map).forEach(id=> document.getElementById(id).addEventListener("input", ()=> Track.saveProfile({[map[id]]: val(id)})));
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const customer = { name:val("coName"), phone:val("coPhone"), email:val("coEmail"), address:val("coAddress"), notes:val("coNotes") };
    if(!/^\+?\d[\d\s-]{7,14}$/.test(customer.phone)){ showToast("Please enter a valid phone number"); return; }
    const cart = Store.getCart();
    const items = Object.keys(cart).filter(id=>{ const p=findProduct(id); return p && !isOut(p); }).map(id=>({id, qty:cart[id]}));
    if(!items.length){ showToast("No available items in your cart"); return; }
    const btn = form.querySelector("button[type=submit]"), label = btn.innerHTML;
    btn.disabled = true; btn.querySelector("span").textContent = "Saving your order…";
    let url;
    try{
      const r = await API.post("/api/enquiry", { visitorId:Track.id, customer, items, base:siteBase() }, { retries:4, wake:true });
      url = r.whatsappUrl;                                     // server-built message incl. enquiry id + server-calculated totals
    }catch(ex){
      if(ex.status){ showToast(ex.message); btn.disabled = false; btn.innerHTML = label; return; }   // validation / stock problem
      url = waLink(waCartMsg(customer));                      // backend unreachable: customer can still order via WhatsApp
      showToast("Server is busy - opening WhatsApp directly");
    }
    Store.setCart({});
    try{ localStorage.removeItem("adil_draft"); }catch(err){}
    navigate("/shop");
    waOpenUrl(url, "checkout");
  });
}

/* ---------------- View: Wishlist ---------------- */
