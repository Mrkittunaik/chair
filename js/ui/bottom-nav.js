/* Floating glass bottom dock for phones: Home · Shop · Quote (centre) · Cart · More */
(function(){
  const I = {
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5.5h4V20"/>',
    shop:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    quote:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    cart:'<path d="M6 7h12l1.2 13H4.8Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    more:'<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>',
    heart:'<path d="M20.8 6.6a5 5 0 0 0-8.8-2.2A5 5 0 0 0 3.2 6.6c0 5 8.8 10.7 8.8 10.7s8.8-5.7 8.8-10.7Z"/>',
    office:'<path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3Z"/><path d="M6 16v4M18 16v4"/>',
    custom:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
    edu:'<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>',
    about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    contact:'<path d="M4 5h16v12H8l-4 3Z"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
  const MORE = [
    {href:"/office-furniture",label:"Office",icon:"office",key:"office"},
    {href:"/custom-office-furniture",label:"Custom",icon:"custom",key:"custom"},
    {href:"/school-college-furniture",label:"Schools",icon:"edu",key:"edu"},
    {href:"/wishlist",label:"Wishlist",icon:"heart",key:"wishlist"},
    {href:"/about",label:"About",icon:"about",key:"about"},
    {href:"/contact",label:"Contact",icon:"contact",key:"contact"}
  ];
  const TABS = [
    {id:"home",label:"Home",href:"/",keys:["home"]},
    {id:"shop",label:"Shop",href:"/shop",keys:["shop"]},
    {id:"bulk",label:"Quote",href:"/bulk-furniture-orders",keys:["bulk"],center:true},
    {id:"cart",label:"Cart",href:"/cart",keys:["cart"]},
    {id:"more",label:"More",keys:MORE.map(m=>m.key)}
  ];
  let dock, sheet, scrim, ind, curKey = "";
  function routeKey(active){
    const p = location.pathname.replace(/\/+$/,"") || "/";
    if(p==="/cart"||p==="/checkout") return "cart";
    if(p==="/wishlist") return "wishlist";
    return active || "";
  }
  function build(){
    dock = document.createElement("nav");
    dock.className = "gdock"; dock.setAttribute("aria-label","Main navigation");
    dock.innerHTML = `<span class="gd-ind" aria-hidden="true"></span>` + TABS.map(t=>{
      const inner = `<span class="gd-ico">${svg(t.id==="bulk"?"quote":t.id)}${t.id==="cart"?'<b class="gd-badge" id="dockCartBadge" hidden>0</b>':''}</span><span class="gd-lbl">${t.label}</span>`;
      return t.href ? `<a class="gd-item${t.center?' gd-center':''}" data-tab="${t.id}" href="${t.href}">${inner}</a>`
                    : `<button type="button" class="gd-item" data-tab="${t.id}" aria-haspopup="true" aria-expanded="false">${inner}</button>`;
    }).join("");
    scrim = document.createElement("div"); scrim.className = "gd-scrim";
    sheet = document.createElement("div"); sheet.className = "gd-sheet"; sheet.setAttribute("role","menu");
    sheet.innerHTML = `<div class="gd-grid">${MORE.map(m=>`<a class="gd-tile" data-key="${m.key}" href="${m.href}" role="menuitem">${svg(m.icon)}<span>${m.label}</span></a>`).join("")}</div>
      <a class="gd-wa" href="#" data-wa="general" target="_blank" rel="noopener">Chat on WhatsApp</a>`;
    document.body.append(scrim, sheet, dock);
    ind = dock.querySelector(".gd-ind");
    const wa = sheet.querySelector(".gd-wa");
    try{ wa.href = waLink("Hello "+WA_BRAND+", I have a question."); }catch(e){}
    dock.addEventListener("click", e=>{
      const b = e.target.closest(".gd-item"); if(!b) return;
      b.classList.remove("tap"); void b.offsetWidth; b.classList.add("tap");
      if(b.dataset.tab==="more"){ e.preventDefault(); toggle(); return; }
      close();
    });
    sheet.addEventListener("click", e=>{ if(e.target.closest("a")) close(); });
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") close(); });
    window.addEventListener("resize", ()=>moveInd(false));
    window.addEventListener("pageshow", ()=>moveInd(false));
  }
  function open(){ sheet.classList.add("show"); scrim.classList.add("show"); const m=dock.querySelector('[data-tab=more]'); m.setAttribute("aria-expanded","true"); m.classList.add("open"); moveInd(true,"more"); }
  function close(){ if(!sheet) return; sheet.classList.remove("show"); scrim.classList.remove("show"); const m=dock.querySelector('[data-tab=more]'); m.setAttribute("aria-expanded","false"); m.classList.remove("open"); moveInd(true); }
  function toggle(){ sheet.classList.contains("show") ? close() : open(); }
  function moveInd(animate, force){
    if(!dock) return;
    const id = force || (TABS.find(t=>t.keys.includes(curKey))||{}).id;
    const el = id && dock.querySelector(`[data-tab="${id}"]`);
    dock.querySelectorAll(".gd-item").forEach(x=>x.classList.toggle("on", x===el));
    if(!el || el.classList.contains("gd-center")){ ind.style.opacity = 0; return; }
    const w = el.offsetWidth - 8;
    ind.style.transition = animate===false ? "none" : "";
    ind.style.width = w+"px"; ind.style.opacity = 1;
    ind.style.transform = `translateX(${el.offsetLeft+4}px)`;
    if(animate===false){ void ind.offsetWidth; ind.style.transition = ""; }
  }
  window.renderBottomNav = function(active){
    if(!dock) build();
    curKey = routeKey(active);
    sheet.querySelectorAll(".gd-tile").forEach(a=>a.classList.toggle("on", a.dataset.key===curKey));
    close();
    requestAnimationFrame(()=>moveInd(!dock.__placed)); dock.__placed = true;
    if(typeof syncBadges==="function") syncBadges();
  };
})();
