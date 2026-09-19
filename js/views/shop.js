function viewShop(params){
  const groups = Object.keys(allCategoryLabels());
  const active = params.cat || "";
  const title = active ? allCategoryLabels()[active] || "All furniture" : "All furniture";
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Shop</p>
      <h1 class="page-title" id="shopTitle">${title}</h1>
      <p class="page-desc" id="shopDesc">Filter by room, price and material. ${allProducts().length} pieces in the catalogue.</p>
    </div>
  </section>
  <section class="section">
    <div class="container shop-layout">
      <aside class="filters" id="filtersPanel">
        <div class="filter-block">
          <h4>Room</h4>
          <label><input type="radio" name="cat" value="" ${!active?"checked":""}> All rooms</label>
          ${groups.map(g=>`<label><input type="radio" name="cat" value="${g}" ${active===g?"checked":""}> ${allCategoryLabels()[g]}</label>`).join("")}
        </div>
        <div class="filter-block">
          <h4>Price (₹)</h4>
          <div class="range-row">
            <input type="number" id="minPrice" placeholder="Min" min="0">
            <input type="number" id="maxPrice" placeholder="Max" min="0">
          </div>
        </div>
        <div class="filter-block">
          <h4>Rating</h4>
          <label><input type="checkbox" id="rate45"> 4.5 and above</label>
        </div>
        <div class="filter-block">
          <button class="btn btn-ghost btn-sm btn-block" id="clearFilters">Clear filters</button>
        </div>
      </aside>

      <div>
        <div class="filter-bar" id="filterBar">
          <div class="filter-bar-item">
            <button class="filter-bar-btn" data-drop="cat">Room<span class="chev">▾</span></button>
            <div class="filter-drop" data-panel="cat">
              <label><input type="radio" name="catM" value="" ${!active?"checked":""}> All rooms</label>
              ${groups.map(g=>`<label><input type="radio" name="catM" value="${g}" ${active===g?"checked":""}> ${allCategoryLabels()[g]}</label>`).join("")}
            </div>
          </div>
          <div class="filter-bar-item">
            <button class="filter-bar-btn" data-drop="price">Price<span class="chev">▾</span></button>
            <div class="filter-drop" data-panel="price">
              <div class="range-row">
                <input type="number" id="minPriceM" placeholder="Min" min="0">
                <input type="number" id="maxPriceM" placeholder="Max" min="0">
              </div>
              <button class="btn btn-primary btn-sm btn-block" data-apply="price" style="margin-top:12px;">Apply</button>
            </div>
          </div>
          <div class="filter-bar-item">
            <button class="filter-bar-btn" data-drop="rating">Rating<span class="chev">▾</span></button>
            <div class="filter-drop" data-panel="rating">
              <label><input type="checkbox" id="rate45M"> 4.5 and above</label>
            </div>
          </div>
          <button class="filter-bar-btn filter-bar-clear" id="clearFiltersM">Clear</button>
        </div>
        <div class="filter-bar-backdrop" id="filterBarBackdrop"></div>

        <div class="result-bar">
          <div class="result-count" id="shopCount"></div>
          <div style="display:flex;gap:10px;align-items:center;">
            <label for="shopSort" style="font-size:13px;color:var(--ink-soft);">Sort</label>
            <select id="shopSort">
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        <div id="shopOutput"></div>
      </div>
    </div>
  </section>`;
}
function afterShop(params){
  const out = document.getElementById("shopOutput");
  const count = document.getElementById("shopCount");
  const sortSel = document.getElementById("shopSort");
  if(params.sort) sortSel.value = params.sort;

  function getCat(){
    const m = document.querySelector("input[name=catM]:checked");
    return m ? m.value : document.querySelector("input[name=cat]:checked").value;
  }
  function apply(){
    const cat = getCat();
    const min = parseInt(document.getElementById("minPrice").value || document.getElementById("minPriceM").value, 10);
    const max = parseInt(document.getElementById("maxPrice").value || document.getElementById("maxPriceM").value, 10);
    const rate = document.getElementById("rate45").checked || document.getElementById("rate45M").checked;
    let list = allProducts().filter(p=>
      (!cat || p.group===cat) &&
      (isNaN(min) || p.price>=min) &&
      (isNaN(max) || p.price<=max) &&
      (!rate || p.rating>=4.5)
    );
    list = sortList(list, sortSel.value);
    count.textContent = `${list.length} ${list.length===1?"piece":"pieces"}`;
    document.getElementById("shopTitle").textContent = cat ? allCategoryLabels()[cat] : "All furniture";
    out.innerHTML = list.length
      ? `<div class="product-grid">${list.map(productCardHTML).join("")}</div>`
      : `<div class="empty-state"><h3>Nothing matches these filters</h3><p>Widen the price range or pick another room.</p><button class="btn btn-primary" id="resetInline">Clear filters</button></div>`;
    groupStagger(); setupReveals();
    const ri = document.getElementById("resetInline");
    if(ri) ri.addEventListener("click", reset);
    history.replaceState(null,"", "#/shop" + (cat? "?cat="+cat : ""));
  }
  function reset(){
    document.querySelector("input[name=cat][value='']").checked = true;
    document.querySelector("input[name=catM][value='']").checked = true;
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("minPriceM").value = "";
    document.getElementById("maxPriceM").value = "";
    document.getElementById("rate45").checked = false;
    document.getElementById("rate45M").checked = false;
    sortSel.value = "featured";
    apply();
  }
  document.querySelectorAll(".filters input").forEach(el=>el.addEventListener("input", apply));
  sortSel.addEventListener("change", apply);
  document.getElementById("clearFilters").addEventListener("click", reset);

  /* ---- Mobile dropdown filter bar ---- */
  const bar = document.getElementById("filterBar");
  const backdrop = document.getElementById("filterBarBackdrop");
  function positionDrop(item){
    const btn = item.querySelector("[data-drop]");
    const drop = item.querySelector(".filter-drop");
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = r.left;
    const maxLeft = vw - drop.offsetWidth - 12;
    if(left > maxLeft) left = Math.max(12, maxLeft);

    // flip above the button if there isn't room below
    let top = r.bottom + 8;
    const h = drop.offsetHeight;
    if(top + h > vh - 12){
      const above = r.top - 8 - h;
      top = above >= 12 ? above : Math.max(12, vh - h - 12);
    }
    drop.style.top = top + "px";
    drop.style.left = left + "px";
  }
  function closeAllDrops(){
    bar.querySelectorAll(".filter-bar-item.open").forEach(i=>i.classList.remove("open"));
    backdrop.classList.remove("show");
  }
  bar.querySelectorAll("[data-drop]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const item = btn.closest(".filter-bar-item");
      const wasOpen = item.classList.contains("open");
      closeAllDrops();
      if(!wasOpen){
        item.classList.add("open");
        backdrop.classList.add("show");
        positionDrop(item);
      }
    });
  });
  window.addEventListener("resize", ()=>{
    const openItem = bar.querySelector(".filter-bar-item.open");
    if(openItem) positionDrop(openItem);
  });
  window.addEventListener("scroll", ()=>{
    const openItem = bar.querySelector(".filter-bar-item.open");
    if(openItem) closeAllDrops();
  }, { passive:true });
  backdrop.addEventListener("click", closeAllDrops);
  bar.querySelectorAll("input[name=catM]").forEach(el=>el.addEventListener("change", ()=>{ apply(); closeAllDrops(); }));
  bar.querySelectorAll("#rate45M").forEach(el=>el.addEventListener("change", apply));
  bar.querySelector("[data-apply=price]").addEventListener("click", ()=>{ apply(); closeAllDrops(); });
  document.getElementById("clearFiltersM").addEventListener("click", ()=>{ reset(); closeAllDrops(); });

  apply();
}

/* ---------------- View: Product ---------------- */
