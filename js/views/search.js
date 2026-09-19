function searchProducts(query){
  const q = query.trim().toLowerCase();
  if(!q) return [];
  const terms = q.split(/\s+/);
  return allProducts().map(p=>{
    const hay = {
      name: p.name.toLowerCase(),
      cat: (p.category + " " + (allCategoryLabels()[p.group]||p.group)).toLowerCase(),
      rest: (p.material + " " + p.color + " " + p.desc).toLowerCase()
    };
    let score = 0, all = true;
    terms.forEach(t=>{
      let s = 0;
      if(hay.name.startsWith(t)) s += 12;
      else if(hay.name.includes(t)) s += 8;
      if(hay.cat.includes(t)) s += 5;
      if(hay.rest.includes(t)) s += 2;
      if(s === 0) all = false;
      score += s;
    });
    return { p, score: all ? score : 0 };
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score || b.p.rating-a.p.rating).map(r=>r.p);
}

function sortList(list, sort){
  const out = list.slice();
  if(sort==="price-low") out.sort((a,b)=>a.price-b.price);
  else if(sort==="price-high") out.sort((a,b)=>b.price-a.price);
  else if(sort==="rating") out.sort((a,b)=>b.rating-a.rating);
  else if(sort==="newest") out.reverse();
  return out;
}

/* ---------------- View: Search (its own page) ---------------- */
function viewSearch(params){
  const q = params.q || "";
  return `
  <section class="search-hero">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Search</p>
      <h1 class="page-title">Search the catalogue</h1>
      <form class="search-form" id="pageSearchForm" role="search">
        <input type="search" id="pageSearchInput" value="${escapeHtml(q)}" placeholder="Try “leather chair”, “oak dining table”, “RGB desk”" aria-label="Search furniture" autocomplete="off">
        <button class="btn btn-primary" type="submit">Search</button>
      </form>
      <div class="suggest-row">
        <span>Popular:</span>
        ${["sofa","office chair","dining table","gaming desk","walnut","bed"].map(s=>`<button class="chip" data-suggest="${s}">${s}</button>`).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="result-bar">
        <div class="result-count" id="resultCount"></div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label for="searchSort" style="font-size:13px;color:var(--ink-soft);">Sort</label>
          <select id="searchSort">
            <option value="relevance">Best match</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      <div class="suggest-row" id="searchFacets" style="margin:0 0 22px;"></div>
      <div id="searchOutput"></div>
    </div>
  </section>`;
}

function afterSearch(params){
  const q = params.q || "";
  const form = document.getElementById("pageSearchForm");
  const input = document.getElementById("pageSearchInput");
  const sortSel = document.getElementById("searchSort");
  const facets = document.getElementById("searchFacets");
  const output = document.getElementById("searchOutput");
  const count = document.getElementById("resultCount");
  let group = params.cat || "all";
  if(params.sort) sortSel.value = params.sort;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  function base(){ return searchProducts(input.value); }

  function draw(){
    const results = base();
    if(!input.value.trim()){
      count.textContent = "";
      facets.innerHTML = "";
      output.innerHTML = `
        <div class="empty-state">
          <h3>Start with a word or two</h3>
          <p>Search by product name, room, material or colour. Everything stays on this page — results appear right below.</p>
          <a href="#/shop" class="btn btn-secondary">Browse all furniture</a>
        </div>
        <div class="section-head" style="margin-top:48px;"><h2>Most loved right now</h2></div>
        <div class="product-grid">${sortList(allProducts(),"rating").slice(0,8).map(productCardHTML).join("")}</div>`;
      return;
    }
    if(results.length === 0){
      count.textContent = "";
      facets.innerHTML = "";
      output.innerHTML = `
        <div class="empty-state">
          <h3>No matches for “${escapeHtml(input.value.trim())}”</h3>
          <p>Check the spelling, use a shorter word, or search by room — like “office”, “bedroom” or “outdoor”.</p>
          <a href="#/shop" class="btn btn-primary">Browse all furniture</a>
        </div>`;
      return;
    }
    const groups = [...new Set(results.map(p=>p.group))];
    facets.innerHTML = `<span>Rooms:</span>` +
      `<button class="chip ${group==='all'?'on':''}" data-facet="all">All (${results.length})</button>` +
      groups.map(g=>{
        const n = results.filter(p=>p.group===g).length;
        return `<button class="chip ${group===g?'on':''}" data-facet="${g}">${allCategoryLabels()[g]||g} (${n})</button>`;
      }).join("");

    const filtered = group==="all" ? results : results.filter(p=>p.group===group);
    const shown = sortList(filtered, sortSel.value);
    count.textContent = `${shown.length} ${shown.length===1?"result":"results"} for “${input.value.trim()}”`;
    output.innerHTML = `<div class="product-grid">${shown.map(productCardHTML).join("")}</div>`;
    groupStagger(); setupReveals();
  }

  function pushHash(){
    const v = input.value.trim();
    const parts = [];
    if(v) parts.push("q="+encodeURIComponent(v));
    if(group!=="all") parts.push("cat="+group);
    if(sortSel.value!=="relevance") parts.push("sort="+sortSel.value);
    history.replaceState(null,"", "#/search" + (parts.length? "?"+parts.join("&") : ""));
  }

  let t;
  input.addEventListener("input", ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{ group="all"; draw(); pushHash(); }, 160);
  });
  form.addEventListener("submit", e=>{ e.preventDefault(); clearTimeout(t); draw(); pushHash(); });
  sortSel.addEventListener("change", ()=>{ draw(); pushHash(); });
  facets.addEventListener("click", e=>{
    const b = e.target.closest("[data-facet]");
    if(!b) return;
    group = b.dataset.facet; draw(); pushHash();
  });
  document.querySelectorAll("[data-suggest]").forEach(b=>{
    b.addEventListener("click", ()=>{ input.value = b.dataset.suggest; group="all"; draw(); pushHash(); });
  });

  if(q) input.value = q;
  draw();
}

/* ---------------- View: Home ---------------- */
/* Default homepage content -- reproduces the original hardcoded homepage exactly.
   Admin edits are shallow-merged on top of this via AdminStore.getHome(), so the
   site always has a complete, valid value even before the admin ever saves anything. */
