function viewProduct(id){
  const p = findProduct(id);
  if(!p) return notFound();
  /* related: same category / shared tags first, in-stock only as primary recommendations */
  const rel = x => (x.category===p.category ? 3 : 0) + (x.group===p.group ? 1 : 0) + ((x.tags||[]).filter(t=>(p.tags||[]).includes(t)).length);
  const related = allProducts().filter(x=>x.id!==p.id && !isOut(x) && rel(x)>0).sort((a,b)=>rel(b)-rel(a)).slice(0,4);
  const out = isOut(p);
  const gallery = (p.images && p.images.length) ? p.images : [p.img];
  const wished = Store.inWish(p.id);
  return `
  <section class="section">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / <a href="#/shop?cat=${p.group}">${allCategoryLabels()[p.group]}</a> / ${escapeHtml(p.name)}</p>
      <div class="pdp" style="margin-top:20px;">
        <div class="pdp-media-wrap">
          <div class="pdp-media img-wrap shimmer"><img id="pdpMain" src="${gallery[0]}" ${fb(p.group)} alt="${escapeHtml(p.name)}">${stockBadge(p)}</div>
          ${gallery.length>1 ? `<div class="pdp-thumbs">${gallery.map((u,i)=>`<button type="button" class="pdp-thumb${i===0?" on":""}" data-img="${u}" aria-label="Image ${i+1}"><img src="${u.replace("c_limit,w_1400","c_fill,w_160,h_160")}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
          ${p.video ? `<video class="pdp-video" src="${p.video}" controls preload="none" playsinline></video>` : ""}
        </div>
        <div>
          <div class="pc-cat">${p.category}</div>
          <h1>${escapeHtml(p.name)}</h1>
          <span class="pc-rating">${ICONS.star}${p.rating} · ${p.material}</span>
          <div class="price">${formatINR(p.price)}${p.compareAtPrice>p.price?` <s class="pc-was">${formatINR(p.compareAtPrice)}</s>`:""}${p.discount>0?` <span class="badge-off inline">-${p.discount}%</span>`:""}</div>
          ${out ? `<p class="stock-note out">Out of stock — message us on WhatsApp to check when it's back.</p>` : p.stockStatus==="LOW_STOCK" ? `<p class="stock-note low">Only a few left in stock.</p>` : `<p class="stock-note ok">In stock</p>`}
          <p style="color:var(--ink-soft);max-width:52ch;">${escapeHtml(p.desc)}</p>
          <div class="pdp-actions">
            <div class="qty">
              <button id="qMinus" aria-label="Decrease quantity">−</button><span id="qVal">1</span><button id="qPlus" aria-label="Increase quantity">+</button>
            </div>
            ${out ? `<button class="btn btn-secondary" id="pdpAdd" disabled>Out of stock</button>` : `<button class="btn btn-primary" id="pdpAdd">Add to cart</button>`}
            <button class="btn btn-secondary" data-wish="${p.id}" style="gap:8px;">${wished?"Saved":"Save"}</button>
          </div>
          <div class="pdp-wa">
            <button class="btn btn-wa btn-block" data-wa="product" data-pid="${p.id}" id="pdpWa">${WA_ICON}<span id="pdpWaLabel">${out?"Ask availability on WhatsApp":"Order on WhatsApp — "+formatINR(p.price)}</span></button>
            <div class="pdp-wa-row">
              <button class="btn btn-secondary" data-wa="bulk" data-pid="${p.id}">Bulk order</button>
              <button class="btn btn-secondary" data-wa="custom" data-pid="${p.id}">Customise</button>
            </div>
            <p class="pdp-wa-note">Opens WhatsApp with the product link, price and quantity filled in.</p>
          </div>
          <table class="spec-table">
            ${p.sku?`<tr><td>SKU</td><td>${escapeHtml(p.sku)}</td></tr>`:""}
            <tr><td>Material</td><td>${p.material}</td></tr>
            <tr><td>Finish</td><td>${p.color}</td></tr>
            ${Object.entries(p.specs||{}).filter(([k])=>!/^(material|colou?r)$/i.test(k)).map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
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
  window.__pdpQty = 1;
  const val = document.getElementById("qVal");
  const waLabel = document.getElementById("pdpWaLabel");
  const setQ = n=>{
    q = n; val.textContent = q; window.__pdpQty = q;
    if(!isOut(p)) waLabel.textContent = "Order on WhatsApp — " + formatINR(p.price*q) + (q>1 ? ` (${q} pcs)` : "");
  };
  document.getElementById("qMinus").addEventListener("click", ()=>setQ(Math.max(1,q-1)));
  document.getElementById("qPlus").addEventListener("click", ()=>setQ(Math.min(999,q+1)));
  document.getElementById("pdpAdd").addEventListener("click", ()=>{ if(Store.addToCart(p.id,q)) showToast(`Added ${q} to cart`); });
  document.querySelectorAll(".pdp-thumb").forEach(b=>b.addEventListener("click",()=>{
    document.getElementById("pdpMain").src = b.dataset.img;
    document.querySelectorAll(".pdp-thumb").forEach(x=>x.classList.toggle("on", x===b));
  }));
}

/* ---------------- View: Cart ---------------- */
