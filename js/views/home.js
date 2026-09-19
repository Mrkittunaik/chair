function defaultHomeContent(){
  return {
    hero: {
      kicker: "New for 2026",
      heading: "Furniture you will still like in ten years.",
      lead: "Solid wood, honest upholstery, and joinery that holds. Made for homes and workspaces in India, delivered and installed by our own team.",
      btn1Text: "Shop all furniture", btn1Link: "#/shop",
      btn2Text: "Search the catalogue", btn2Link: "#/search",
      mark1Num: "42", mark1Label: "pieces in stock",
      mark2Num: "10 yrs", mark2Label: "of workshop craft",
      mark3Num: "Free", mark3Label: "install above ₹25,000",
      img: IMG.livingRoomHero, alt: "Living room with a fabric sofa, lounge chair and low coffee table",
      visible: true
    },
    catRail: { title: "Shop by room", visible: true },
    collectionsSection: { title: "Collections", sub: "Pieces grouped the way rooms actually come together.", visible: true },
    collections: [
      {title:"Sofas that hold a room together",label:"Living room",img:IMG.collectionLiving,href:"#/shop?cat=sofas"},
      {title:"Desks and chairs for long working days",label:"Office",img:IMG.collectionOffice,href:"#/shop?cat=office"},
      {title:"Beds, wardrobes and quiet corners",label:"Bedroom",img:IMG.collectionBedroom,href:"#/shop?cat=bedroom"},
      {title:"Tables built for long dinners",label:"Dining",img:IMG.collectionDining,href:"#/shop?cat=dining"},
      {title:"Weather-ready seating for the outdoors",label:"Outdoor",img:IMG.collectionOutdoor,href:"#/shop?cat=outdoor"},
      {title:"Setups made for late-night play",label:"Gaming",img:IMG.collectionGaming,href:"#/shop?cat=gaming"}
    ],
    featured1: { group: "office", title: "Office", sub: "Chairs, desks and storage for focused work.", visible: true },
    featured2: { group: "gaming", title: "Gaming", sub: "Desks and seating that survive long sessions.", visible: true },
    about: {
      heading: "Built in our own workshop, not bought off a container.",
      body: "Every frame is cut, joined and finished by a team we know by name. If something loosens in the first five years, we come and fix it.",
      img: IMG.aboutBanner, alt: "Workshop bench with tools and timber",
      stat1Num: "10+", stat1Label: "Years of craft",
      stat2Num: "800+", stat2Label: "Homes furnished",
      stat3Num: "5 yr", stat3Label: "Frame warranty",
      visible: true
    },
    promo: {
      heading: "Not sure where to start?",
      body: "Tell us the room, the size and the budget. We will send back three options and a delivery date.",
      btnText: "Ask for a plan", btnLink: "#/contact",
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
  const collections = H.collections;
  return `
  ${H.hero.visible ? `
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy-anim">
        <p class="kicker">${escapeHtml(H.hero.kicker)}</p>
        <h1>${escapeHtml(H.hero.heading)}</h1>
        <p class="lead">${escapeHtml(H.hero.lead)}</p>
        <div class="hero-actions">
          <a href="${H.hero.btn1Link}" class="btn btn-primary">${escapeHtml(H.hero.btn1Text)}</a>
          <a href="${H.hero.btn2Link}" class="btn btn-secondary">${escapeHtml(H.hero.btn2Text)}</a>
        </div>
        <div class="hero-marks">
          <div><strong>${escapeHtml(H.hero.mark1Num)}</strong>${escapeHtml(H.hero.mark1Label)}</div>
          <div><strong>${escapeHtml(H.hero.mark2Num)}</strong>${escapeHtml(H.hero.mark2Label)}</div>
          <div><strong>${escapeHtml(H.hero.mark3Num)}</strong>${escapeHtml(H.hero.mark3Label)}</div>
        </div>
      </div>
      <div class="hero-image img-wrap shimmer"><img src="${H.hero.img}" ${fb("sofas")} alt="${escapeHtml(H.hero.alt)}"></div>
    </div>
  </section>` : ""}

  ${H.catRail.visible ? `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${escapeHtml(H.catRail.title)}</h2><a href="#/shop" class="view-all">See everything</a></div>
      <div class="cat-rail">
        ${categories.filter(c=>cats[c.key]).map(c=>`
          <a href="#/shop?cat=${c.key}" class="cat-card">
            <div class="cat-img img-wrap shimmer"><img src="${c.img}" ${fb(c.key)} alt="${c.label}" loading="lazy"></div>
            <div class="cat-name">${cats[c.key]}</div>
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
      <div class="section-head"><div><h2>${escapeHtml(H.featured1.title)}</h2><p class="section-sub">${escapeHtml(H.featured1.sub)}</p></div><a href="#/shop?cat=${H.featured1.group}" class="view-all">View all</a></div>
      <div class="product-grid" id="featuredPreview1"></div>
    </div>
  </section>` : ""}

  ${H.featured2.visible ? `
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><div><h2>${escapeHtml(H.featured2.title)}</h2><p class="section-sub">${escapeHtml(H.featured2.sub)}</p></div><a href="#/shop?cat=${H.featured2.group}" class="view-all">View all</a></div>
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
        <div class="stat-row">
          <div class="stat"><div class="num">${escapeHtml(H.about.stat1Num)}</div><div class="lbl">${escapeHtml(H.about.stat1Label)}</div></div>
          <div class="stat"><div class="num">${escapeHtml(H.about.stat2Num)}</div><div class="lbl">${escapeHtml(H.about.stat2Label)}</div></div>
          <div class="stat"><div class="num">${escapeHtml(H.about.stat3Num)}</div><div class="lbl">${escapeHtml(H.about.stat3Label)}</div></div>
        </div>
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

  ${H.newArrivals.visible ? `
  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${escapeHtml(H.newArrivals.title)}</h2><a href="#/shop?sort=newest" class="view-all">View all</a></div>
      <div class="product-grid" id="newArrivals"></div>
    </div>
  </section>` : ""}`;
}
function afterHome(){
  const H = homeContent();
  const p1 = document.getElementById("featuredPreview1");
  const p2 = document.getElementById("featuredPreview2");
  if(p1) renderProductGrid(p1, allProducts().filter(p=>p.group===H.featured1.group).slice(0,4));
  if(p2) renderProductGrid(p2, allProducts().filter(p=>p.group===H.featured2.group).slice(0,4));
  const na = document.getElementById("newArrivals");
  if(na) renderProductGrid(na, allProducts().slice(-8).reverse());
}

/* ---------------- View: Shop ---------------- */
