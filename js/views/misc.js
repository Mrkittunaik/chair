function viewWishlist(){
  const ids = Store.getWish();
  const list = ids.map(findProduct).filter(Boolean);
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Wishlist</p>
      <h1 class="page-title">Saved pieces</h1>
      <p class="page-desc">${list.length? list.length + " saved. They stay here on this device." : "Nothing saved yet."}</p>
    </div>
  </section>
  <section class="section"><div class="container">
    ${list.length
      ? `<div class="product-grid">${list.map(productCardHTML).join("")}</div>`
      : `<div class="empty-state"><h3>Your wishlist is empty</h3><p>Tap the heart on any piece to keep it here while you decide.</p><a href="#/shop" class="btn btn-primary">Browse furniture</a></div>`}
  </div></section>`;
}

/* ---------------- View: About ---------------- */
function viewAbout(){
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / About</p>
      <h1 class="page-title">About Prabot</h1>
      <p class="page-desc">A furniture workshop in Hyderabad making pieces for homes and offices since 2016.</p>
    </div>
  </section>
  <section class="section">
    <div class="container about-grid">
      <div class="about-img"><img src="${IMG.aboutBanner}" ${fb("general")} alt="Craftsman working at a bench"></div>
      <div>
        <h2>We make furniture the way a carpenter would want it made.</h2>
        <p>Prabot started with two carpenters and one order for a dining table. We still build the same way: seasoned timber, tested joinery, and upholstery you can re-cover instead of replace.</p>
        <p style="margin-top:14px;">Every order is delivered and installed by our own team, so nothing arrives in a flat box with a hex key and a prayer.</p>
        <div class="stat-row">
          <div class="stat"><div class="num">2016</div><div class="lbl">Workshop opened</div></div>
          <div class="stat"><div class="num">42</div><div class="lbl">Pieces in production</div></div>
          <div class="stat"><div class="num">800+</div><div class="lbl">Homes furnished</div></div>
        </div>
      </div>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container">
      <div class="section-head"><h2>How we work</h2></div>
      <div class="value-grid">
        <div class="value-card"><h3>Materials first</h3><p>Solid wood and veneer over engineered board wherever the piece carries weight.</p></div>
        <div class="value-card"><h3>Made to be repaired</h3><p>Bolted frames and removable covers, so a worn piece gets fixed instead of thrown out.</p></div>
        <div class="value-card"><h3>Installed by us</h3><p>Our fitters carry it in, level it, and take the packaging away with them.</p></div>
      </div>
    </div>
  </section>
  <section class="section section-tight">
    <div class="container">
      <div class="promo">
        <img src="${IMG.livingRoom2}" ${fb("sofas")} alt="Finished living room">
        <div class="promo-in">
          <h2>Visit the workshop</h2>
          <p>See the joinery before you buy. Walk-ins welcome Monday to Saturday.</p>
          <a href="#/contact" class="btn btn-primary">Book a visit</a>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------------- View: Contact ---------------- */
function viewContact(){
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Contact</p>
      <h1 class="page-title">Get in touch</h1>
      <p class="page-desc">Questions about an order, a custom piece, or a trade account — send a note and we reply within a working day.</p>
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
              <option>A custom piece</option>
              <option>Trade and bulk orders</option>
              <option>Something else</option>
            </select>
          </div>
          <div class="field"><label for="cMsg">Message</label><textarea id="cMsg" required></textarea></div>
          <button class="btn btn-primary btn-block" type="submit">Send message</button>
        </form>
      </div>
      <div>
        <div class="info-line"><strong>Workshop</strong><span>${escapeHtml(AdminStore.getSettings().address)}</span></div>
        <div class="info-line"><strong>Phone</strong><span>${escapeHtml(AdminStore.getSettings().phone)}</span></div>
        <div class="info-line"><strong>Email</strong><span>${escapeHtml(AdminStore.getSettings().email)}</span></div>
        <div class="info-line"><strong>Hours</strong><span>Mon–Sat, 10am to 7pm</span></div>
        <div class="about-img" style="margin-top:22px;"><img src="${IMG.collectionLiving}" ${fb("sofas")} alt="Showroom floor" loading="lazy"></div>
      </div>
    </div>
  </section>`;
}
function afterContact(){
  document.getElementById("contactForm").addEventListener("submit", e=>{
    e.preventDefault(); e.target.reset(); showToast("Message sent");
  });
}

function notFound(){
  return `<section class="section"><div class="container"><div class="empty-state">
    <h3>That page does not exist</h3><p>The link may be old or mistyped. Search the catalogue or head back home.</p>
    <a href="#/search" class="btn btn-primary">Search</a></div></div></section>`;
}

/* ---------------- Admin: login ---------------- */
