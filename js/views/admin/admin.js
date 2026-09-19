function viewAdminLogin(){
  const firstTime = !AdminStore.hasPin();
  return `
  <section class="page-head">
    <div class="container">
      <p class="breadcrumb"><a href="#/">Home</a> / Admin</p>
      <h1 class="page-title">Admin login</h1>
      <p class="page-desc">${firstTime ? "Set a PIN to protect the admin panel." : "Enter your PIN to manage products and categories."}</p>
    </div>
  </section>
  <section class="section">
    <div class="container" style="max-width:380px;">
      <div class="form-card">
        <form id="adminLoginForm">
          <div class="field">
            <label for="adminPin">${firstTime ? "Create a PIN" : "PIN"}</label>
            <input id="adminPin" type="password" inputmode="numeric" pattern="[0-9]*" minlength="4" maxlength="8" autocomplete="off" required autofocus>
          </div>
          ${firstTime ? `<div class="field"><label for="adminPinConfirm">Confirm PIN</label><input id="adminPinConfirm" type="password" inputmode="numeric" pattern="[0-9]*" minlength="4" maxlength="8" autocomplete="off" required></div>` : ""}
          <p id="adminLoginError" style="color:#B3261E;font-size:13px;display:none;margin-bottom:10px;">Incorrect PIN.</p>
          <button class="btn btn-primary btn-block" type="submit">${firstTime ? "Set PIN and enter" : "Log in"}</button>
        </form>
      </div>
    </div>
  </section>`;
}
function afterAdminLogin(){
  const form = document.getElementById("adminLoginForm");
  const firstTime = !AdminStore.hasPin();
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const pin = document.getElementById("adminPin").value.trim();
    if(firstTime){
      const confirmPin = document.getElementById("adminPinConfirm").value.trim();
      if(pin.length < 4){ showToast("PIN must be at least 4 digits"); return; }
      if(pin !== confirmPin){ showToast("PINs do not match"); return; }
      AdminStore.setPin(pin);
      AdminStore.login();
      location.hash = "#/admin/panel";
      return;
    }
    if(AdminStore.checkPin(pin)){
      AdminStore.login();
      location.hash = "#/admin/panel";
    } else {
      document.getElementById("adminLoginError").style.display = "block";
      form.reset();
      document.getElementById("adminPin").focus();
    }
  });
}

/* ---------------- Admin: panel ---------------- */
function adminTabBar(active){
  const tabs = [
    {key:"dashboard", label:"Dashboard"},
    {key:"orders", label:"Orders"},
    {key:"products", label:"Products"},
    {key:"categories", label:"Categories"},
    {key:"homepage", label:"Homepage"},
    {key:"settings", label:"Settings"}
  ];
  return `<div class="admin-tabs" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:18px;">
    ${tabs.map(t=>`<a href="#/admin/panel?tab=${t.key}" class="btn btn-sm ${active===t.key?'btn-primary':'btn-ghost'}">${t.label}</a>`).join("")}
  </div>`;
}

function viewAdminPanel(params){
  const products = allProducts();
  const cats = allCategoryLabels();
  const categories = allCategories();
  const tab = params.tab || "dashboard";
  const editId = params.edit || "";
  const editing = editId ? products.find(p=>p.id===editId) : null;

  /* Product form's category dropdown: grouped by the fixed groups, options are admin-managed categories.
     Choosing a category also fixes the product's group (category.group), so group is never picked directly. */
  const catOptions = FIXED_GROUPS.map(g=>{
    const opts = categoriesByGroup(g).map(c=>
      `<option value="${c.id}" ${editing && editing.category===c.name && editing.group===g ? "selected":""}>${escapeHtml(c.name)}</option>`
    ).join("");
    return opts ? `<optgroup label="${escapeHtml(cats[g]||g)}">${opts}</optgroup>` : "";
  }).join("");

  const head = `
  <section class="page-head">
    <div class="container" style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div>
        <p class="breadcrumb"><a href="#/">Home</a> / Admin panel</p>
        <h1 class="page-title">Admin panel</h1>
        <p class="page-desc">Manage products, categories and homepage content. Changes apply immediately across the site.</p>
        ${adminTabBar(tab)}
      </div>
      <button class="btn btn-secondary btn-sm" id="adminLogoutBtn">Log out</button>
    </div>
  </section>`;

  if(tab === "dashboard") return head + viewAdminDashboard(products, cats);
  if(tab === "homepage") return head + viewAdminHomepage();
  if(tab === "categories") return head + viewAdminCategories(cats, products, params);
  if(tab === "orders") return head + viewAdminOrders(params);
  if(tab === "settings") return head + viewAdminSettings();
  return head + viewAdminProducts(products, cats, editing, catOptions);
}

function viewAdminDashboard(products, cats){
  const featured = products.filter(p=>p.featured).length;
  const orders = AdminStore.getOrders();
  const revenue = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const pending = orders.filter(o=>o.status==="pending").length;
  const recent = orders.slice(0,5);
  return `
  <section class="section">
    <div class="container">
      <div class="dash-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px;">
        ${[
          ["Total products", products.length],
          ["Categories", allCategories().length],
          ["Featured products", featured],
          ["Orders", orders.length],
          ["Pending orders", pending],
          ["Revenue", formatINR(revenue)],
        ].map(([label,val])=>`
          <div class="form-card" style="padding:18px;">
            <div style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.04em;">${label}</div>
            <div style="font-family:var(--serif);font-size:30px;margin-top:6px;">${val}</div>
          </div>`).join("")}
      </div>
      <h2 style="font-size:18px;margin-bottom:12px;">Quick actions</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px;">
        <a href="#/admin/panel?tab=products" class="btn btn-primary btn-sm">Add product</a>
        <a href="#/admin/panel?tab=categories" class="btn btn-secondary btn-sm">Add category</a>
        <a href="#/admin/panel?tab=homepage" class="btn btn-secondary btn-sm">Edit homepage</a>
        <a href="#/admin/panel?tab=settings" class="btn btn-secondary btn-sm">Site settings</a>
      </div>
      <h2 style="font-size:18px;margin-bottom:12px;">Recent orders</h2>
      ${recent.length ? `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${recent.map(o=>`
              <tr>
                <td>${o.id}</td>
                <td>${escapeHtml(o.customer.name)}</td>
                <td>${formatINR(o.total)}</td>
                <td>${orderStatusBadge(o.status)}</td>
                <td><a href="#/admin/panel?tab=orders&view=${o.id}" class="btn btn-sm btn-ghost">View</a></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : `<p style="color:var(--ink-soft);font-size:13.5px;">No orders placed yet.</p>`}
    </div>
  </section>`;
}

function orderStatusBadge(status){
  const colors = { pending:"#B7791F", confirmed:"#2563EB", shipped:"#7C3AED", delivered:"#15803D", cancelled:"#B3261E" };
  const c = colors[status] || "#666";
  return `<span style="display:inline-block;padding:3px 9px;border-radius:100px;font-size:11.5px;font-weight:700;text-transform:capitalize;color:#fff;background:${c};">${status}</span>`;
}

/* ---------------- Admin: orders ---------------- */
function viewAdminOrders(params){
  const orders = AdminStore.getOrders();
  const viewId = params.view || "";
  const viewing = viewId ? orders.find(o=>o.id===viewId) : null;

  if(viewing){
    return `
    <section class="section"><div class="container" style="max-width:720px;">
      <a href="#/admin/panel?tab=orders" class="btn btn-sm btn-ghost" style="margin-bottom:16px;">← All orders</a>
      <div class="form-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:20px;">${viewing.id}</h2>
            <p style="color:var(--ink-soft);font-size:13px;">${new Date(viewing.createdAt).toLocaleString("en-IN")}</p>
          </div>
          ${orderStatusBadge(viewing.status)}
        </div>
        <h3 style="font-size:14px;margin-bottom:8px;">Customer</h3>
        <p style="font-size:13.5px;line-height:1.7;margin-bottom:16px;">
          ${escapeHtml(viewing.customer.name)}<br>
          ${escapeHtml(viewing.customer.phone)} · ${escapeHtml(viewing.customer.email)}<br>
          ${escapeHtml(viewing.customer.address)}
          ${viewing.customer.notes ? `<br><em>Note: ${escapeHtml(viewing.customer.notes)}</em>` : ""}
        </p>
        <h3 style="font-size:14px;margin-bottom:8px;">Items</h3>
        <div class="admin-table-wrap" style="margin-bottom:16px;">
          <table class="admin-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${viewing.items.map(it=>`<tr><td>${escapeHtml(it.name)}</td><td>${it.qty}</td><td>${formatINR(it.price)}</td><td>${formatINR(it.price*it.qty)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="sum-row"><span>Subtotal</span><span>${formatINR(viewing.subtotal)}</span></div>
        <div class="sum-row"><span>Delivery</span><span>${viewing.shipping? formatINR(viewing.shipping):"Free"}</span></div>
        <div class="sum-total" style="margin-bottom:18px;"><span>Total</span><span>${formatINR(viewing.total)}</span></div>
        <div class="field"><label for="orderStatusSelect">Update status</label>
          <select id="orderStatusSelect" data-order-id="${viewing.id}">
            ${["pending","confirmed","shipped","delivered","cancelled"].map(s=>`<option value="${s}" ${viewing.status===s?"selected":""}>${s[0].toUpperCase()+s.slice(1)}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-sm btn-ghost" data-del-order="${viewing.id}">Delete order</button>
      </div>
    </div></section>`;
  }

  return `
  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:14px;">Orders (${orders.length})</h2>
      ${orders.length ? `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${orders.map(o=>`
              <tr>
                <td>${o.id}</td>
                <td>${new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                <td>${escapeHtml(o.customer.name)}</td>
                <td>${o.items.reduce((s,it)=>s+it.qty,0)}</td>
                <td>${formatINR(o.total)}</td>
                <td>${orderStatusBadge(o.status)}</td>
                <td><a href="#/admin/panel?tab=orders&view=${o.id}" class="btn btn-sm btn-ghost">View</a></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : `<div class="empty-state"><h3>No orders yet</h3><p>Orders placed at checkout will show up here.</p></div>`}
    </div>
  </section>`;
}

/* ---------------- Admin: settings ---------------- */
function viewAdminSettings(){
  const s = AdminStore.getSettings();
  return `
  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:14px;">Site settings</h2>
      <div class="form-card" style="max-width:520px;margin-bottom:24px;">
        <form id="settingsForm">
          <div class="field"><label for="stSiteName">Site name</label><input id="stSiteName" value="${escapeHtml(s.siteName)}"></div>
          <div class="field"><label for="stPhone">Contact phone</label><input id="stPhone" value="${escapeHtml(s.phone)}"></div>
          <div class="field"><label for="stEmail">Contact email</label><input id="stEmail" type="email" value="${escapeHtml(s.email)}"></div>
          <div class="field"><label for="stAddress">Address</label><input id="stAddress" value="${escapeHtml(s.address)}"></div>
          <div class="field"><label for="stFreeShip">Free delivery threshold (₹)</label><input id="stFreeShip" type="number" min="0" value="${s.freeShipThreshold}"></div>
          <div class="field"><label for="stShipCost">Delivery cost below threshold (₹)</label><input id="stShipCost" type="number" min="0" value="${s.shipCost}"></div>
          <button class="btn btn-primary" type="submit">Save settings</button>
        </form>
      </div>
      <h2 style="font-size:20px;margin-bottom:14px;">Backup &amp; restore</h2>
      <div class="form-card" style="max-width:520px;">
        <p style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;">Export all admin data (products, categories, homepage content, orders, settings) as a JSON file, or restore from a previous export. Data lives in this browser's storage only.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" id="exportDataBtn">Export data</button>
          <label class="btn btn-ghost btn-sm" style="cursor:pointer;">Import data<input type="file" id="importDataFile" accept="application/json" style="display:none;"></label>
        </div>
      </div>
    </div>
  </section>`;
}

function viewAdminCategories(cats, products, params){
  const categories = allCategories();
  const editId = params && params.editCat || "";
  const editing = editId ? categories.find(c=>c.id===editId) : null;
  const groupOptions = FIXED_GROUPS.map(g=>`<option value="${g}" ${editing && editing.group===g ? "selected":""}>${escapeHtml(cats[g]||g)}</option>`).join("");

  return `
  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:6px;">Rooms / groups</h2>
      <p style="font-size:13px;color:var(--ink-soft);margin:0 0 14px;">Fixed — these 9 can't be added, removed or renamed. Every category below belongs to one.</p>
      <div class="admin-table-wrap" style="margin-bottom:32px;">
        <table class="admin-table">
          <thead><tr><th>Group key</th><th>Label</th><th>Categories</th><th>Products</th></tr></thead>
          <tbody>
            ${FIXED_GROUPS.map(g=>`
              <tr>
                <td>${g}</td>
                <td>${escapeHtml(cats[g])}</td>
                <td>${categories.filter(c=>c.group===g).length}</td>
                <td>${products.filter(p=>p.group===g).length}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>

      <h2 style="font-size:20px;margin-bottom:14px;">${editing ? "Edit category" : "Categories"}</h2>
      <div class="form-card" style="max-width:520px;margin-bottom:18px;">
        <form id="adminCategoryForm">
          <input type="hidden" id="cfId" value="${editing ? editing.id : ""}">
          <div class="field"><label for="cfName">Category name (e.g. "Office Chair")</label><input id="cfName" required value="${editing ? escapeHtml(editing.name) : ""}"></div>
          <div class="field"><label for="cfGroupSel">Room / group</label>
            <select id="cfGroupSel" required ${editing ? "disabled" : ""}>${groupOptions}</select>
            ${editing ? `<p style="font-size:12px;color:var(--ink-soft);margin:6px 0 0;">Group can't be changed once created — delete and re-add in a different group if needed.</p>` : ""}
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary" type="submit">${editing ? "Save changes" : "Add category"}</button>
            ${editing ? `<a href="#/admin/panel?tab=categories" class="btn btn-ghost">Cancel</a>` : ""}
          </div>
        </form>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Category</th><th>Group</th><th>Products</th><th></th></tr></thead>
          <tbody>
            ${categories.map(c=>`
              <tr>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(cats[c.group]||c.group)}</td>
                <td>${products.filter(p=>p.category===c.name && p.group===c.group).length}</td>
                <td>
                  <a href="#/admin/panel?tab=categories&editCat=${c.id}" class="btn btn-sm btn-ghost">Edit</a>
                  <button class="btn btn-sm btn-ghost" data-del-cat="${c.id}">Remove</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
}

function viewAdminProducts(products, cats, editing, catOptions){
  return `
  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:14px;">${editing ? "Edit product" : "Add a product"}</h2>
      <div class="form-card" style="max-width:640px;">
        <form id="adminProductForm">
          <input type="hidden" id="pfId" value="${editing ? editing.id : ""}">
          <div class="field"><label for="pfName">Name</label><input id="pfName" required value="${editing ? escapeHtml(editing.name) : ""}"></div>
          <div class="field"><label for="pfCategoryId">Category</label>
            <select id="pfCategoryId" required>
              <option value="" disabled ${editing?"":"selected"}>Select a category…</option>
              ${catOptions}
            </select>
            <p style="font-size:12px;color:var(--ink-soft);margin:6px 0 0;">Don't see the right one? <a href="#/admin/panel?tab=categories">Add a category</a> first — categories belong to a fixed room/group.</p>
          </div>
          <div class="field"><label for="pfPrice">Price (₹)</label><input id="pfPrice" type="number" min="0" step="1" required value="${editing ? editing.price : ""}"></div>
          <div class="field"><label for="pfMaterial">Material</label><input id="pfMaterial" value="${editing ? escapeHtml(editing.material||"") : ""}"></div>
          <div class="field"><label for="pfColor">Color</label><input id="pfColor" value="${editing ? escapeHtml(editing.color||"") : ""}"></div>
          <div class="field"><label for="pfRating">Rating (0–5)</label><input id="pfRating" type="number" min="0" max="5" step="0.1" value="${editing ? editing.rating : "4.5"}"></div>
          <div class="field"><label for="pfDesc">Description</label><textarea id="pfDesc">${editing ? escapeHtml(editing.desc||"") : ""}</textarea></div>
          <div class="field"><label for="pfImg">Image</label>
            <input id="pfImgFile" type="file" accept="image/*">
            <input type="hidden" id="pfImg" value="${editing ? editing.img : ""}">
            <div id="pfImgPreview" style="margin-top:8px;max-width:160px;">${editing && editing.img ? `<img src="${editing.img}" style="width:100%;border-radius:4px;border:1px solid var(--line);">` : ""}</div>
          </div>
          <div class="field"><label><input type="checkbox" id="pfFeatured" ${editing && editing.featured ? "checked":""}> Featured product</label></div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" type="submit">${editing ? "Save changes" : "Add product"}</button>
            ${editing ? `<a href="#/admin/panel?tab=products" class="btn btn-ghost">Cancel</a>` : ""}
          </div>
        </form>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:14px;">All products (${products.length})</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Group</th><th>Price</th><th>Featured</th><th></th></tr></thead>
          <tbody>
            ${products.map(p=>`
              <tr>
                <td><img src="${p.img}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;" onerror="this.src='${FALLBACK_IMG}'"></td>
                <td>${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.category)}</td>
                <td>${cats[p.group] || p.group}</td>
                <td>${formatINR(p.price)}</td>
                <td>${p.featured ? "★" : ""}</td>
                <td style="white-space:nowrap;">
                  <a href="#/admin/panel?tab=products&edit=${p.id}" class="btn btn-sm btn-ghost">Edit</a>
                  <button class="btn btn-sm btn-ghost" data-del-prod="${p.id}">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
}

/* ---------------- Admin: homepage editor ---------------- */
function viewAdminHomepage(){
  const H = homeContent();
  const field = (label, id, val, type)=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" ${type?`type="${type}"`:""} value="${escapeHtml(String(val==null?"":val))}"></div>`;
  const imgField = (label, id, val)=>`<div class="field"><label>${label}</label>
    <input id="${id}File" type="file" accept="image/*">
    <input type="hidden" id="${id}" value="${escapeHtml(val||"")}">
    <div id="${id}Preview" style="margin-top:8px;max-width:200px;">${val ? `<img src="${val}" style="width:100%;border-radius:4px;border:1px solid var(--line);">` : ""}</div>
  </div>`;
  const visField = (label, id, checked)=>`<label style="display:flex;align-items:center;gap:6px;margin-bottom:14px;font-size:13px;"><input type="checkbox" id="${id}" ${checked?"checked":""}> ${label}</label>`;

  return `
  <section class="section">
    <div class="container">
      <h2 style="font-size:20px;margin-bottom:4px;">Hero</h2>
      <p class="section-sub" style="margin-bottom:14px;">The first thing visitors see.</p>
      <div class="form-card" style="max-width:640px;margin-bottom:26px;">
        <form id="heroForm">
          ${visField("Show hero section", "heroVisible", H.hero.visible)}
          ${field("Kicker", "heroKicker", H.hero.kicker)}
          ${field("Heading", "heroHeading", H.hero.heading)}
          ${field("Description", "heroLead", H.hero.lead)}
          ${field("Primary button text", "heroBtn1Text", H.hero.btn1Text)}
          ${field("Primary button link", "heroBtn1Link", H.hero.btn1Link)}
          ${field("Secondary button text", "heroBtn2Text", H.hero.btn2Text)}
          ${field("Secondary button link", "heroBtn2Link", H.hero.btn2Link)}
          ${field("Stat 1 number", "heroMark1Num", H.hero.mark1Num)}${field("Stat 1 label", "heroMark1Label", H.hero.mark1Label)}
          ${field("Stat 2 number", "heroMark2Num", H.hero.mark2Num)}${field("Stat 2 label", "heroMark2Label", H.hero.mark2Label)}
          ${field("Stat 3 number", "heroMark3Num", H.hero.mark3Num)}${field("Stat 3 label", "heroMark3Label", H.hero.mark3Label)}
          ${imgField("Hero image", "heroImg", H.hero.img)}
          ${field("Image alt text", "heroAlt", H.hero.alt)}
          <button class="btn btn-primary" type="submit">Save hero</button>
        </form>
      </div>

      <h2 style="font-size:20px;margin-bottom:4px;">Featured product rows</h2>
      <p class="section-sub" style="margin-bottom:14px;">The two room previews under Collections.</p>
      <div class="form-card" style="max-width:640px;margin-bottom:26px;">
        <form id="featuredForm">
          ${visField("Show row 1", "f1Visible", H.featured1.visible)}
          ${field("Row 1 title", "f1Title", H.featured1.title)}
          ${field("Row 1 subtitle", "f1Sub", H.featured1.sub)}
          ${field("Row 1 category group key", "f1Group", H.featured1.group)}
          <hr style="margin:18px 0;border:none;border-top:1px solid var(--line);">
          ${visField("Show row 2", "f2Visible", H.featured2.visible)}
          ${field("Row 2 title", "f2Title", H.featured2.title)}
          ${field("Row 2 subtitle", "f2Sub", H.featured2.sub)}
          ${field("Row 2 category group key", "f2Group", H.featured2.group)}
          <button class="btn btn-primary" type="submit">Save featured rows</button>
        </form>
      </div>

      <h2 style="font-size:20px;margin-bottom:4px;">About / brand story</h2>
      <div class="form-card" style="max-width:640px;margin-bottom:26px;">
        <form id="aboutForm">
          ${visField("Show about section", "aboutVisible", H.about.visible)}
          ${field("Heading", "aboutHeading", H.about.heading)}
          ${field("Body text", "aboutBody", H.about.body)}
          ${field("Stat 1 number", "aboutStat1Num", H.about.stat1Num)}${field("Stat 1 label", "aboutStat1Label", H.about.stat1Label)}
          ${field("Stat 2 number", "aboutStat2Num", H.about.stat2Num)}${field("Stat 2 label", "aboutStat2Label", H.about.stat2Label)}
          ${field("Stat 3 number", "aboutStat3Num", H.about.stat3Num)}${field("Stat 3 label", "aboutStat3Label", H.about.stat3Label)}
          ${imgField("About image", "aboutImg", H.about.img)}
          <button class="btn btn-primary" type="submit">Save about section</button>
        </form>
      </div>

      <h2 style="font-size:20px;margin-bottom:4px;">Promotional banner</h2>
      <div class="form-card" style="max-width:640px;margin-bottom:26px;">
        <form id="promoForm">
          ${visField("Show promo banner", "promoVisible", H.promo.visible)}
          ${field("Heading", "promoHeading", H.promo.heading)}
          ${field("Body text", "promoBody", H.promo.body)}
          ${field("Button text", "promoBtnText", H.promo.btnText)}
          ${field("Button link", "promoBtnLink", H.promo.btnLink)}
          ${imgField("Banner image", "promoImg", H.promo.img)}
          <button class="btn btn-primary" type="submit">Save promo banner</button>
        </form>
      </div>

      <h2 style="font-size:20px;margin-bottom:4px;">Collections grid</h2>
      <p class="section-sub" style="margin-bottom:14px;">The 6 cards below Shop by room.</p>
      <div class="form-card" style="max-width:640px;">
        <form id="collectionsForm">
          ${H.collections.map((c,i)=>`
            <div style="border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:14px;">
              <strong style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;">Card ${i+1}</strong>
              ${field("Label", "colLabel"+i, c.label)}
              ${field("Title", "colTitle"+i, c.title)}
              ${field("Link", "colHref"+i, c.href)}
            </div>`).join("")}
          <button class="btn btn-primary" type="submit">Save collections</button>
        </form>
      </div>
    </div>
  </section>`;
}
/* Wires an <input type=file> to read the chosen image as a data URL into a hidden
   input (id) and update its preview <div id+"Preview">. Keeps everything client-side. */
function wireImageInput(fileId, hiddenId, previewId){
  const fileEl = document.getElementById(fileId);
  if(!fileEl) return;
  fileEl.addEventListener("change", ()=>{
    const file = fileEl.files && fileEl.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      document.getElementById(hiddenId).value = reader.result;
      const prev = document.getElementById(previewId);
      if(prev) prev.innerHTML = `<img src="${reader.result}" style="width:100%;border-radius:4px;border:1px solid var(--line);">`;
    };
    reader.readAsDataURL(file);
  });
}

function afterAdminPanel(){
  document.getElementById("adminLogoutBtn").addEventListener("click", ()=>{
    AdminStore.logout();
    location.hash = "#/admin";
  });

  const productForm = document.getElementById("adminProductForm");
  if(productForm){
    wireImageInput("pfImgFile", "pfImg", "pfImgPreview");
    productForm.addEventListener("submit", e=>{
      e.preventDefault();
      const id = document.getElementById("pfId").value || AdminStore.nextId();
      const catId = document.getElementById("pfCategoryId").value;
      const cat = allCategories().find(c=>c.id===catId);
      if(!cat){ showToast("Pick a category"); return; }
      const existingImg = document.getElementById("pfImg").value;
      const p = {
        id,
        name: document.getElementById("pfName").value.trim(),
        category: cat.name,
        group: cat.group,
        price: Number(document.getElementById("pfPrice").value) || 0,
        img: existingImg || (findProduct(id) && findProduct(id).img) || Object.values(IMG)[0],
        rating: Number(document.getElementById("pfRating").value) || 4.5,
        material: document.getElementById("pfMaterial").value.trim(),
        color: document.getElementById("pfColor").value.trim(),
        desc: document.getElementById("pfDesc").value.trim(),
        featured: document.getElementById("pfFeatured").checked
      };
      AdminStore.upsertProduct(p);
      showToast(document.getElementById("pfId").value ? "Product updated" : "Product added");
      location.hash = "#/admin/panel?tab=products";
      if(location.hash === "#/admin/panel?tab=products") render();
    });
  }

  document.querySelectorAll("[data-del-prod]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del-prod");
      if(confirm("Delete this product? It will be removed from the catalogue.")){
        AdminStore.deleteProduct(id);
        showToast("Product deleted");
        render();
      }
    });
  });

  const catForm = document.getElementById("adminCategoryForm");
  if(catForm){
    catForm.addEventListener("submit", e=>{
      e.preventDefault();
      const existingId = document.getElementById("cfId").value;
      const name = document.getElementById("cfName").value.trim();
      if(!name) return;
      let cat;
      if(existingId){
        // Editing: group is fixed/disabled in the form, so keep the category's existing group.
        const current = allCategories().find(c=>c.id===existingId);
        cat = { id: existingId, name, group: current ? current.group : document.getElementById("cfGroupSel").value };
      } else {
        const group = document.getElementById("cfGroupSel").value;
        if(!FIXED_GROUPS.includes(group)) return;
        cat = { id: AdminStore.nextCategoryId(group), name, group };
      }
      AdminStore.upsertCategory(cat);
      showToast(existingId ? "Category updated" : "Category added");
      location.hash = "#/admin/panel?tab=categories";
      if(location.hash === "#/admin/panel?tab=categories") render();
    });
  }

  document.querySelectorAll("[data-del-cat]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del-cat");
      const cat = allCategories().find(c=>c.id===id);
      const inUse = cat && allProducts().some(p=>p.category===cat.name && p.group===cat.group);
      if(inUse){ showToast("Can't remove — products still use this category"); return; }
      if(confirm("Remove this category?")){
        AdminStore.deleteCategory(id);
        showToast("Category removed");
        render();
      }
    });
  });

  /* ---- Homepage editor forms (only present on the Homepage tab) ---- */
  wireImageInput("heroImgFile", "heroImg", "heroImgPreview");
  wireImageInput("aboutImgFile", "aboutImg", "aboutImgPreview");
  wireImageInput("promoImgFile", "promoImg", "promoImgPreview");

  const heroForm = document.getElementById("heroForm");
  if(heroForm){
    heroForm.addEventListener("submit", e=>{
      e.preventDefault();
      const v = id=>document.getElementById(id).value;
      AdminStore.saveHome({ hero: {
        visible: document.getElementById("heroVisible").checked,
        kicker: v("heroKicker"), heading: v("heroHeading"), lead: v("heroLead"),
        btn1Text: v("heroBtn1Text"), btn1Link: v("heroBtn1Link"),
        btn2Text: v("heroBtn2Text"), btn2Link: v("heroBtn2Link"),
        mark1Num: v("heroMark1Num"), mark1Label: v("heroMark1Label"),
        mark2Num: v("heroMark2Num"), mark2Label: v("heroMark2Label"),
        mark3Num: v("heroMark3Num"), mark3Label: v("heroMark3Label"),
        img: v("heroImg"), alt: v("heroAlt")
      }});
      showToast("Hero saved");
      render();
    });
  }

  const featuredForm = document.getElementById("featuredForm");
  if(featuredForm){
    featuredForm.addEventListener("submit", e=>{
      e.preventDefault();
      const v = id=>document.getElementById(id).value;
      AdminStore.saveHome({
        featured1: { visible: document.getElementById("f1Visible").checked, title: v("f1Title"), sub: v("f1Sub"), group: v("f1Group").trim() },
        featured2: { visible: document.getElementById("f2Visible").checked, title: v("f2Title"), sub: v("f2Sub"), group: v("f2Group").trim() }
      });
      showToast("Featured rows saved");
      render();
    });
  }

  const aboutForm = document.getElementById("aboutForm");
  if(aboutForm){
    aboutForm.addEventListener("submit", e=>{
      e.preventDefault();
      const v = id=>document.getElementById(id).value;
      AdminStore.saveHome({ about: {
        visible: document.getElementById("aboutVisible").checked,
        heading: v("aboutHeading"), body: v("aboutBody"),
        stat1Num: v("aboutStat1Num"), stat1Label: v("aboutStat1Label"),
        stat2Num: v("aboutStat2Num"), stat2Label: v("aboutStat2Label"),
        stat3Num: v("aboutStat3Num"), stat3Label: v("aboutStat3Label"),
        img: v("aboutImg"), alt: (homeContent().about.alt)
      }});
      showToast("About section saved");
      render();
    });
  }

  const promoForm = document.getElementById("promoForm");
  if(promoForm){
    promoForm.addEventListener("submit", e=>{
      e.preventDefault();
      const v = id=>document.getElementById(id).value;
      AdminStore.saveHome({ promo: {
        visible: document.getElementById("promoVisible").checked,
        heading: v("promoHeading"), body: v("promoBody"),
        btnText: v("promoBtnText"), btnLink: v("promoBtnLink"),
        img: v("promoImg"), alt: (homeContent().promo.alt)
      }});
      showToast("Promo banner saved");
      render();
    });
  }

  const collectionsForm = document.getElementById("collectionsForm");
  if(collectionsForm){
    collectionsForm.addEventListener("submit", e=>{
      e.preventDefault();
      const cur = homeContent().collections;
      const updated = cur.map((c,i)=>({
        ...c,
        label: document.getElementById("colLabel"+i).value,
        title: document.getElementById("colTitle"+i).value,
        href: document.getElementById("colHref"+i).value
      }));
      AdminStore.saveHome({ collections: updated });
      showToast("Collections saved");
      render();
    });
  }

  /* ---- Orders tab ---- */
  const statusSelect = document.getElementById("orderStatusSelect");
  if(statusSelect){
    statusSelect.addEventListener("change", ()=>{
      AdminStore.updateOrderStatus(statusSelect.dataset.orderId, statusSelect.value);
      showToast("Order status updated");
      render();
    });
  }
  document.querySelectorAll("[data-del-order]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(confirm("Delete this order? This cannot be undone.")){
        AdminStore.deleteOrder(btn.getAttribute("data-del-order"));
        showToast("Order deleted");
        location.hash = "#/admin/panel?tab=orders";
        render();
      }
    });
  });

  /* ---- Settings tab ---- */
  const settingsForm = document.getElementById("settingsForm");
  if(settingsForm){
    settingsForm.addEventListener("submit", e=>{
      e.preventDefault();
      const v = id=>document.getElementById(id).value;
      AdminStore.saveSettings({
        siteName: v("stSiteName").trim(),
        phone: v("stPhone").trim(),
        email: v("stEmail").trim(),
        address: v("stAddress").trim(),
        freeShipThreshold: Number(v("stFreeShip")) || 0,
        shipCost: Number(v("stShipCost")) || 0
      });
      showToast("Settings saved");
      render();
    });
  }
  const exportBtn = document.getElementById("exportDataBtn");
  if(exportBtn){
    exportBtn.addEventListener("click", ()=>{
      const data = {
        products: AdminStore.getOverrides(),
        deleted: AdminStore.getDeleted(),
        categories: AdminStore.getCatOverrides(),
        categoriesDeleted: AdminStore.getCatDeleted(),
        home: AdminStore.getHome(),
        orders: AdminStore.getOrders(),
        settings: AdminStore.getSettings(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "prabot-admin-backup.json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast("Backup downloaded");
    });
  }
  const importFile = document.getElementById("importDataFile");
  if(importFile){
    importFile.addEventListener("change", ()=>{
      const file = importFile.files && importFile.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          if(data.products) AdminStore.write(AdminStore.prodKey, data.products);
          if(data.deleted) AdminStore.write(AdminStore.delKey, data.deleted);
          if(data.categories) AdminStore.write(AdminStore.catKey, data.categories);
          if(data.categoriesDeleted) AdminStore.write(AdminStore.catDelKey, data.categoriesDeleted);
          if(data.home) AdminStore.write(AdminStore.homeKey, data.home);
          if(data.orders) AdminStore.saveOrders(data.orders);
          if(data.settings) AdminStore.saveSettings(data.settings);
          showToast("Data restored");
          render();
        }catch(err){
          showToast("Invalid backup file");
        }
      };
      reader.readAsText(file);
    });
  }
}


/* ---------------- Motion helpers ---------------- */
