const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=1600&q=80"
];

function defaultHomeContent(){
  return {
    hero: {
      kicker: "Quality furniture at competitive prices",
      heading: "Custom Office Chairs & Furniture for Offices, Schools & Colleges Across India",
      lead: "Office chairs, tables and workstations, with customisation for size, colour and material. Based in Hyderabad, serving customers across India.",
      btn1Text: "Office furniture", btn1Link: "/office-furniture",
      btn2Text: "Request a quote", btn2Link: "/bulk-furniture-orders",
      img: IMG.livingRoomHero, alt: "Office chairs and tables in a modern workspace",
      visible: true
    },
    catRail: { title: "Shop by category", visible: true },
    collectionsSection: { title: "Desks and workstations", sub: "Layouts for executive cabins, study corners, open offices and growing teams.", visible: true },
    collections: [
      {title:"Executive desks for corner offices",label:"Executive",img:"/assets/collections/executive-office-desk-india.webp",href:"/office-tables"},
      {title:"Compact desks for home study corners",label:"Study",img:"/assets/collections/study-desk-for-home-office-india.webp",href:"/office-tables"},
      {title:"Height-adjustable desks for open floors",label:"Open office",img:"/assets/collections/open-office-workstations-india.webp",href:"/office-tables"},
      {title:"Modular benching for growing teams",label:"Team desks",img:"/assets/collections/modular-team-desks-office-india.webp",href:"/custom-office-tables"},
      {title:"Collaborative workstations with storage",label:"Workstations",img:"/assets/collections/collaborative-office-workstations-india.webp",href:"/office-tables"},
      {title:"Cluster desks built for busy floors",label:"Clusters",img:"/assets/collections/cluster-workstation-desks-india.webp",href:"/bulk-furniture-orders"}
    ],
    featured1: { group: "office", title: "Office furniture", sub: "Chairs, desks and storage for focused work.", visible: true },
    featured2: { group: "gaming", title: "Gaming", sub: "Desks and seating that survive long sessions.", visible: true },
    about: {
      heading: "Furniture for offices, schools and colleges.",
      body: "We supply office chairs, tables and institutional furniture at competitive prices, and take custom requirements for size, colour and material. Send us your list and we will quote.",
      img: IMG.aboutBanner, alt: "Furniture being finished in a workshop",
      stat1Num: "", stat1Label: "", stat2Num: "", stat2Label: "", stat3Num: "", stat3Label: "",
      visible: true
    },
    promo: {
      heading: "Not sure where to start?",
      body: "Tell us what you need, the quantity and your budget, and we will send a quote.",
      btnText: "Request a quote", btnLink: "/bulk-furniture-orders",
      img: IMG.bannerSofa, alt: "Sofa and lounge chair in a bright room",
      visible: true
    },
    newArrivals: { title: "New arrivals", visible: true }
  };
}
/* Deep-ish merge: admin overrides replace matching top-level keys' fields, arrays replace wholesale. */
function homeContent(){
  const d = defaultHomeContent();
  const o = AdminStore.getHome();
  const out = {};
  Object.keys(d).forEach(k=>{
    if(Array.isArray(d[k])) out[k] = o[k] || d[k];
    else out[k] = Object.assign({}, d[k], o[k] || {});
  });
  return out;
}

function viewHome(){
  const H = homeContent();
  const categories = [
    {key:"office",label:"Office",img:IMG.collectionOffice},
    {key:"gaming",label:"Gaming",img:IMG.collectionGaming},
    {key:"sofas",label:"Sofas",img:IMG.sofa1},
    {key:"tables",label:"Tables",img:IMG.coffeeTable1},
    {key:"bedroom",label:"Beds",img:IMG.bed1},
    {key:"dining",label:"Dining",img:IMG.diningTable1},
    {key:"lighting",label:"Lighting",img:IMG.lighting1},
    {key:"outdoor",label:"Outdoor",img:IMG.outdoor1},
    {key:"decor",label:"Decor",img:IMG.decor1}
  ];
  const cats = allCategoryLabels();
  /* categories created in Admin appear automatically (image = first product in that category) */
  Object.keys(cats).forEach(k=>{ if(!categories.some(c=>c.key===k)){ const pr = allProducts().find(x=>x.group===k); categories.push({key:k,label:cats[k],img:pr?pr.img:""}); } });
  const collections = H.collections;
  return `
  ${H.hero.visible ? `
  <section class="hero-card-wrap">
    <div class="hero-card">
      <div class="hero-slideshow">
        ${HERO_SLIDES.map((src,i)=>`<div class="hero-slide${i===0?" active":""}" style="background-image:url('${src}')"></div>`).join("")}
        <div class="hero-scrim"></div>
      </div>
      <div class="hero-card-content">
        <h1 class="hero-card-title">${escapeHtml(H.hero.heading)}</h1>
        <p class="hero-card-lead">${escapeHtml(H.hero.lead)}</p>
        <div class="hero-card-actions">
          <a href="${H.hero.btn1Link}" class="btn-pill btn-pill-ghost">${escapeHtml(H.hero.btn1Text)}</a>
          <a href="${H.hero.btn2Link}" class="btn-pill btn-pill-solid">${escapeHtml(H.hero.btn2Text)}</a>
        </div>
      </div>
    </div>
  </section>` : ""}

  ${H.catRail.visible ? `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${escapeHtml(H.catRail.title)}</h2><a href="/shop" class="view-all">See everything</a></div>
      <div class="cat-rail">
        ${categories.filter(c=>cats[c.key]).map(c=>`
          <a href="${groupHref(c.key)}" class="cat-card">
            <div class="cat-img img-wrap shimmer">
              <img src="${c.img}" ${fb(c.key)} alt="${c.label}" loading="lazy">
              <div class="cat-name">${cats[c.key]}</div>
            </div>
          </a>`).join("")}
      </div>
    </div>
  </section>` : ""}

  ${H.collectionsSection.visible ? `
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><div><h2>${escapeHtml(H.collectionsSection.title)}</h2><p class="section-sub">${escapeHtml(H.collectionsSection.sub)}</p></div></div>
      <div class="grid-collections">
        ${collections.map(c=>`
          <a href="${c.href}" class="collection-card">
            <img src="${c.img}" ${fb(c.href.split("cat=")[1]||"general")} alt="${escapeHtml(c.title)}" loading="lazy">
            <div class="overlay"><div class="cname">${escapeHtml(c.label)}</div><div class="ctitle">${escapeHtml(c.title)}</div></div>
          </a>`).join("")}
      </div>
    </div>
  </section>` : ""}

  ${H.featured1.visible ? `
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><div><h2>${escapeHtml(H.featured1.title)}</h2><p class="section-sub">${escapeHtml(H.featured1.sub)}</p></div><a href="${groupHref(H.featured1.group)}" class="view-all">View all</a></div>
      <div class="product-grid" id="featuredPreview1"></div>
    </div>
  </section>` : ""}

  ${H.featured2.visible ? `
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><div><h2>${escapeHtml(H.featured2.title)}</h2><p class="section-sub">${escapeHtml(H.featured2.sub)}</p></div><a href="${groupHref(H.featured2.group)}" class="view-all">View all</a></div>
      <div class="product-grid" id="featuredPreview2"></div>
    </div>
  </section>` : ""}

  ${H.about.visible ? `
  <section class="section section-tight">
    <div class="container about-grid">
      <div class="about-img"><img src="${H.about.img}" ${fb("general")} alt="${escapeHtml(H.about.alt)}" loading="lazy"></div>
      <div>
        <h2>${escapeHtml(H.about.heading)}</h2>
        <p>${escapeHtml(H.about.body)}</p>
      </div>
    </div>
  </section>` : ""}

  ${H.promo.visible ? `
  <section class="section section-tight">
    <div class="container">
      <div class="promo">
        <img src="${H.promo.img}" ${fb("sofas")} alt="${escapeHtml(H.promo.alt)}" loading="lazy">
        <div class="promo-in">
          <h2>${escapeHtml(H.promo.heading)}</h2>
          <p>${escapeHtml(H.promo.body)}</p>
          <a href="${H.promo.btnLink}" class="btn btn-primary">${escapeHtml(H.promo.btnText)}</a>
        </div>
      </div>
    </div>
  </section>` : ""}

  <section class="section section-tight seo-content" id="seoHome"></section>

  ${H.newArrivals.visible ? `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${escapeHtml(H.newArrivals.title)}</h2><a href="/shop?sort=newest" class="view-all">View all</a></div>
      <div class="product-grid" id="newArrivals"></div>
    </div>
  </section>` : ""}`;
}
function afterHome(){
  seoLoad().then(L=>{
    const el = document.getElementById("seoHome"); if(!el || !L) return;
    const ctx = seoCtx(), pg = L.PAGES["/"];
    el.innerHTML = `<div class="container">${L.sectionsHTML(pg, ctx)}</div><div class="container seo-faq"><div class="section-head"><h2>Frequently asked questions</h2></div>${pg.faqs.map(f=>`<details><summary>${escapeHtml(f.q)}</summary><p>${escapeHtml(f.a)}</p></details>`).join("")}</div>`;
  });
  const slides = document.querySelectorAll(".hero-slide");
  if(slides.length){
    let idx = 0;
    clearInterval(window.__heroSlideTimer);
    window.__heroSlideTimer = setInterval(()=>{
      slides[idx].classList.remove("active");
      idx = (idx+1) % slides.length;
      slides[idx].classList.add("active");
    }, 3500);
  }
  const H = homeContent();
  const p1 = document.getElementById("featuredPreview1");
  const p2 = document.getElementById("featuredPreview2");
  if(p1) renderProductGrid(p1, allProducts().filter(p=>p.group===H.featured1.group).slice(0,4));
  if(p2) renderProductGrid(p2, allProducts().filter(p=>p.group===H.featured2.group).slice(0,4));
  const na = document.getElementById("newArrivals");
  if(na) renderProductGrid(na, allProducts().slice(-8).reverse());
}

/* ---------------- View: Shop ---------------- */
