function viewWishlist(){
  const ids = Store.getWish();
  const list = ids.map(findProduct).filter(Boolean);
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / Wishlist</p>
      <h1 class="page-title">Saved pieces</h1>
      <p class="page-desc">${list.length? list.length + " saved. They stay here on this device." : "Nothing saved yet."}</p>
    </div>
  </section>
  <section class="section"><div class="container">
    ${list.length
      ? `<div class="product-grid">${list.map(productCardHTML).join("")}</div>`
      : `<div class="empty-state"><h3>Your wishlist is empty</h3><p>Tap the heart on any piece to keep it here while you decide.</p><a href="/shop" class="btn btn-primary">Browse furniture</a></div>`}
  </div></section>`;
}

/* ---------------- View: About ---------------- */
function viewAbout(){
  const st = AdminStore.getSettings();
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / About</p>
      <h1 class="page-title">About ${escapeHtml(st.siteName)}</h1>
      <p class="page-desc">A Hyderabad-based supplier of office, school and college furniture, with customisation and delivery across India.</p>
    </div>
  </section>
  <section class="section">
    <div class="container about-grid">
      <div class="about-img"><img src="${IMG.aboutBanner}" ${fb("general")} alt="Furniture being finished in a workshop" width="1200" height="800" loading="lazy"></div>
      <div>
        <h2>Quality furniture at competitive prices.</h2>
        <p>We supply office chairs, office tables, workstations and institutional furniture for offices, startups, schools, colleges and training institutes.</p>
        <p style="margin-top:14px;">If a standard size or finish does not fit your space, we take custom requirements. Send us the details and we will quote.</p>
        <p style="margin-top:14px;"><a class="btn btn-primary" href="/bulk-furniture-orders">Request a Quote</a></p>
      </div>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><h2>What we do</h2></div>
      <div class="value-grid">
        <div class="value-card"><h3>Office furniture</h3><p>Chairs, tables, workstations and storage for offices of every size. <a href="/office-furniture">See office furniture</a>.</p></div>
        <div class="value-card"><h3>Custom furniture</h3><p>Size, colour and material to your requirement. <a href="/custom-office-furniture">See custom furniture</a>.</p></div>
        <div class="value-card"><h3>Schools &amp; colleges</h3><p>Bulk furniture for educational institutions. <a href="/school-college-furniture">See school &amp; college furniture</a>.</p></div>
      </div>
    </div>
  </section>`;
}

/* ---------------- View: Contact ---------------- */
function contactMapsHTML(){
  const st = AdminStore.getSettings(), L = window.SeoLib;
  const u = (st.mapsUrl && /^https:\/\//.test(st.mapsUrl) ? st.mapsUrl : "") || (L ? L.SITE.mapsUrl : "");
  return /^https:\/\//.test(u||"") ? `<div class="info-line"><strong>Directions</strong><span><a class="btn btn-secondary btn-sm" href="${escapeHtml(u)}" target="_blank" rel="noopener">Get Directions on Google Maps</a></span></div>` : "";
}
function viewContact(){
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / Contact</p>
      <h1 class="page-title">Get in touch</h1>
      <p class="page-desc">Questions about an order, custom furniture or a bulk quote - call, message us on WhatsApp or send a note. <a href="/bulk-furniture-orders">Request a Quote</a>.</p>
    </div>
  </section>
  <section class="section">
    <div class="container contact-grid">
      <div class="form-card">
        <form id="contactForm">
          <div class="field"><label for="cName">Your name</label><input id="cName" required></div>
          <div class="field"><label for="cEmail">Email</label><input id="cEmail" type="email" required></div>
          <div class="field"><label for="cTopic">What is this about</label>
            <select id="cTopic">
              <option>An existing order</option>
              <option>Custom furniture quote</option>
              <option>Bulk orders (offices, schools, colleges)</option>
              <option>Something else</option>
            </select>
          </div>
          <div class="field"><label for="cMsg">Message</label><textarea id="cMsg" required></textarea></div>
          <button class="btn btn-wa btn-block" type="submit">${WA_ICON}<span>Send on WhatsApp</span></button>
        </form>
      </div>
      <div>
        <div class="info-line"><strong>Address</strong><span>${escapeHtml(AdminStore.getSettings().address)}</span></div>
        <div class="info-line"><strong>Phone / WhatsApp</strong><span><a href="${waLink('Hello '+WA_BRAND+', I have a question.')}" data-wa="general" target="_blank" rel="noopener">${WA_DISPLAY}</a></span></div>
        <div class="info-line"><strong>Call</strong><span><a href="tel:${escapeHtml(WA_DISPLAY.replace(/[^+\d]/g,""))}">${WA_DISPLAY}</a></span></div>
        <div class="info-line"><strong>Email</strong><span><a href="mailto:${escapeHtml(AdminStore.getSettings().email)}">${escapeHtml(AdminStore.getSettings().email)}</a></span></div>${contactMapsHTML()}
        <div class="info-line"><strong>Hours</strong><span>Mon–Sat, 10am to 7pm</span></div>
        <p style="margin-top:22px;"><a class="btn btn-primary" href="/bulk-furniture-orders">Get a Custom Furniture Quote</a> <a class="btn btn-secondary" href="/bulk-furniture-orders">Ask About Bulk Orders</a></p>
      </div>
    </div>
  </section>`;
}
function afterContact(){
  document.getElementById("contactForm").addEventListener("submit", e=>{
    e.preventDefault();
    const name = document.getElementById("cName").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const topic = document.getElementById("cTopic").value;
    const text = document.getElementById("cMsg").value.trim();
    waOpen(`Hello ${WA_BRAND},\n\n*${topic}*\n${text}\n\nName: ${name}\nEmail: ${email}`);
    e.target.reset(); showToast("Opening WhatsApp…");
  });
}

function notFound(){
  return `<section class="section"><div class="container"><div class="empty-state">
    <h1>That page does not exist</h1><p>The link may be old or mistyped. Search the catalogue or head back home.</p>
    <a href="/search" class="btn btn-primary">Search</a></div></div></section>`;
}
