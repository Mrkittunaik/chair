function viewProduct(id){
  const p = findProduct(id);
  if(!p) return notFound();
  const related = allProducts().filter(x=>x.group===p.group && x.id!==p.id).slice(0,4);
  const wished = Store.inWish(p.id);
  return `
  <section class="section">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / <a href="#/shop?cat=${p.group}">${allCategoryLabels()[p.group]}</a> / ${escapeHtml(p.name)}</p>
      <div class="pdp" style="margin-top:20px;">
        <div class="pdp-media img-wrap shimmer"><img src="${p.img}" ${fb(p.group)} alt="${escapeHtml(p.name)}"></div>
        <div>
          <div class="pc-cat">${p.category}</div>
          <h1>${escapeHtml(p.name)}</h1>
          <span class="pc-rating">${ICONS.star}${p.rating} · ${p.material}</span>
          <div class="price">${formatINR(p.price)}</div>
          <p style="color:var(--ink-soft);max-width:52ch;">${escapeHtml(p.desc)}</p>
          <div class="pdp-actions">
            <div class="qty">
              <button id="qMinus" aria-label="Decrease quantity">−</button><span id="qVal">1</span><button id="qPlus" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" id="pdpAdd">Add to cart</button>
            <button class="btn btn-secondary" data-wish="${p.id}" style="gap:8px;">${wished?"Saved":"Save"}</button>
          </div>
          <table class="spec-table">
            <tr><td>Material</td><td>${p.material}</td></tr>
            <tr><td>Finish</td><td>${p.color}</td></tr>
            <tr><td>Room</td><td>${allCategoryLabels()[p.group]}</td></tr>
            <tr><td>Delivery</td><td>7–10 days, installed</td></tr>
            <tr><td>Warranty</td><td>5 years on the frame</td></tr>
          </table>
        </div>
      </div>
    </div>
  </section>
  ${related.length? `
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><h2>Goes well with this</h2></div>
      <div class="product-grid">${related.map(productCardHTML).join("")}</div>
    </div>
  </section>`:""}`;
}
function afterProduct(id){
  const p = findProduct(id); if(!p) return;
  let q = 1;
  const val = document.getElementById("qVal");
  document.getElementById("qMinus").addEventListener("click", ()=>{ q = Math.max(1,q-1); val.textContent=q; });
  document.getElementById("qPlus").addEventListener("click", ()=>{ q = Math.min(20,q+1); val.textContent=q; });
  document.getElementById("pdpAdd").addEventListener("click", ()=>{ Store.addToCart(p.id,q); showToast(`Added ${q} to cart`); });
}

/* ---------------- View: Cart ---------------- */
