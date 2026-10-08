/* ---------------- View: Office Bulk Enquiry ----------------
   Saves the enquiry to MongoDB first (gets an enquiry id), then opens WhatsApp with a structured message. */
const BULK_KINDS = [
  { key:"Chairs", match:/chair/i }, { key:"Tables", match:/table/i }, { key:"Desks", match:/desk/i },
  { key:"Conference Tables", match:/conference/i }, { key:"Workstations", match:/workstation/i },
  { key:"Storage", match:/storage|shelf|cabinet/i }, { key:"School Furniture", match:null }, { key:"College / Institutional Furniture", match:null }, { key:"Custom Furniture", match:null }, { key:"Other Office Furniture", match:null }
];
let BULK_ROWS = [{ kind:"Chairs", product:"", qty:10, budgetMin:"", budgetMax:"" }];

function bulkSuggestions(kind){
  const k = BULK_KINDS.find(x=>x.key===kind);
  return allProducts().filter(p=>p.group==="office" && (!k||!k.match || k.match.test(p.category+" "+p.name))).map(p=>p.name).slice(0,12);
}
function bulkMessageHTML(){
  const b = AdminStore.getSettings().bulk || {};
  const total = BULK_ROWS.reduce((a,r)=>a+(+r.qty||0),0);
  const min = b.minQty || 10;
  if(total >= min){
    let m = "Bulk quantity selected — you may be eligible for a special price.";
    if(b.customMessage) m = b.customMessage;
    else if(b.discountPercent>0) m += ` Bulk orders of ${min}+ pieces can get up to ${b.discountPercent}% off.`;   // only when the admin configured a discount
    return `<div class="bulk-note on"><strong>${escapeHtml(m)}</strong></div>`;
  }
  return `<div class="bulk-note">${escapeHtml(b.message || "Select the furniture you need and we'll send you our best bulk quotation.")}</div>`;
}
function bulkRowHTML(r,i){
  return `
  <div class="bulk-row" data-i="${i}">
    <div class="bulk-row-head"><span class="bulk-num">Item ${i+1}</span>
      ${BULK_ROWS.length>1 ? `<button type="button" class="link-btn" data-bdel="${i}">Remove</button>` : ""}</div>
    <div class="bulk-grid">
      <div class="field"><label>Furniture type</label>
        <select data-bf="kind">${BULK_KINDS.map(k=>`<option ${k.key===r.kind?"selected":""}>${k.key}</option>`).join("")}</select></div>
      <div class="field"><label>Product / model <span class="opt">(optional)</span></label>
        <input data-bf="product" list="bulkDL${i}" placeholder="e.g. Executive Chair" value="${escapeHtml(r.product)}">
        <datalist id="bulkDL${i}">${bulkSuggestions(r.kind).map(n=>`<option value="${escapeHtml(n)}">`).join("")}</datalist></div>
      <div class="field"><label>Quantity</label>
        <div class="qty bulk-qty"><button type="button" data-bq="-1" aria-label="Decrease">−</button><input data-bf="qty" type="number" inputmode="numeric" min="1" max="100000" value="${r.qty}" aria-label="Quantity"><button type="button" data-bq="1" aria-label="Increase">+</button></div></div>
      <div class="field"><label>Budget per piece (₹)</label>
        <div class="bulk-budget"><input data-bf="budgetMin" type="number" inputmode="numeric" min="0" placeholder="Min" value="${r.budgetMin}"><span>–</span><input data-bf="budgetMax" type="number" inputmode="numeric" min="0" placeholder="Max" value="${r.budgetMax}"></div></div>
    </div>
  </div>`;
}
function viewBulk(){
  const dr = Track.draft(), v = k => escapeHtml(dr[k]||"");
  return `
  <section class="bulk-hero">
    <div class="container">
      <p class="breadcrumb"><a href="/">Home</a> / Bulk orders</p>
      <span class="lead-eyebrow">For offices, schools, colleges &amp; institutions</span>
      <h1 class="page-title">Bulk Furniture Orders - Request a Quote</h1>
      <p class="page-desc">Select the furniture you need, add any size, colour or material requirements in the notes, and send your requirement to us. Serving customers across India from Hyderabad.</p>
    </div>
  </section>
  <section class="section">
    <div class="container bulk-layout">
      <form class="form-card" id="bulkForm" novalidate>
        <h3 class="bulk-h">What do you need?</h3>
        <div id="bulkRows"></div>
        <button type="button" class="btn btn-secondary" id="bulkAdd">+ Add another product</button>
        <div id="bulkNote"></div>
        <h3 class="bulk-h">Your details</h3>
        <div class="bulk-grid">
          <div class="field"><label for="bkCompany">Company name</label><input id="bkCompany" autocomplete="organization" value="${v("company")}"></div>
          <div class="field"><label for="bkName">Contact person</label><input id="bkName" autocomplete="name" required value="${v("name")}"></div>
          <div class="field"><label for="bkPhone">Phone number</label><input id="bkPhone" type="tel" inputmode="tel" autocomplete="tel" required value="${v("phone")}"></div>
          <div class="field"><label for="bkEmail">Email <span class="opt">(optional)</span></label><input id="bkEmail" type="email" autocomplete="email" value="${v("email")}"></div>
          <div class="field"><label for="bkCity">Delivery city</label><input id="bkCity" autocomplete="address-level2"></div>
        </div>
        <div class="field"><label for="bkNotes">Notes <span class="opt">(optional)</span></label><textarea id="bkNotes" placeholder="Customisation (size, colour, material), timeline, anything else…"></textarea></div>
        <p class="bulk-err" id="bkErr" role="alert" hidden></p>
        <button class="btn btn-wa btn-block" type="submit" id="bkSubmit">${WA_ICON}<span>Send Enquiry on WhatsApp</span></button>
        <p class="lead-fine">We save your enquiry first, then open WhatsApp with the details filled in. Tap Send there to confirm.</p>
      </form>
      <aside class="summary bulk-aside">
        <h3>Why order in bulk?</h3>
        <ul class="bulk-points">
          <li>Special pricing on larger quantities</li><li>Matching finishes across the whole office</li>
          <li>Delivery and installation handled by our team</li><li>A written quotation, no obligation</li>
        </ul>
        <div class="sum-row"><span>Total pieces</span><strong id="bkTotal">0</strong></div>
      </aside>
    </div>
  </section>`;
}
function afterBulk(){
  const rowsEl = document.getElementById("bulkRows");
  const refresh = ()=>{
    document.getElementById("bkTotal").textContent = BULK_ROWS.reduce((a,r)=>a+(+r.qty||0),0);
    document.getElementById("bulkNote").innerHTML = bulkMessageHTML();
  };
  const draw = ()=>{ rowsEl.innerHTML = BULK_ROWS.map(bulkRowHTML).join(""); refresh(); };
  draw();
  rowsEl.addEventListener("input", e=>{
    const f = e.target.dataset.bf, row = e.target.closest(".bulk-row"); if(!f||!row) return;
    BULK_ROWS[+row.dataset.i][f] = e.target.value; refresh();
  });
  rowsEl.addEventListener("change", e=>{ if(e.target.dataset.bf==="kind") draw(); });
  rowsEl.addEventListener("click", e=>{
    const row = e.target.closest(".bulk-row");
    const q = e.target.closest("[data-bq]"), d = e.target.closest("[data-bdel]");
    if(q && row){ const r = BULK_ROWS[+row.dataset.i]; r.qty = Math.max(1, Math.min(100000, (+r.qty||0) + (+q.dataset.bq))); draw(); }
    if(d){ BULK_ROWS.splice(+d.dataset.bdel,1); draw(); }
  });
  document.getElementById("bulkAdd").addEventListener("click", ()=>{
    if(BULK_ROWS.length>=20) return showToast("Maximum 20 items per enquiry");
    BULK_ROWS.push({ kind:"Tables", product:"", qty:5, budgetMin:"", budgetMax:"" }); draw();
  });
  ["bkName","bkPhone","bkEmail"].forEach(id=>document.getElementById(id).addEventListener("input", e=>Track.saveProfile({[id==="bkName"?"name":id==="bkPhone"?"phone":"email"]: e.target.value.trim()})));

  const form = document.getElementById("bulkForm"), err = document.getElementById("bkErr");
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const val = id => document.getElementById(id).value.trim();
    const fail = m=>{ err.textContent = m; err.hidden = false; err.scrollIntoView({block:"center",behavior:"smooth"}); };
    const items = BULK_ROWS.map(r=>({ kind:r.kind, product:(r.product||"").trim(), qty:Math.floor(+r.qty||0), budgetMin:+r.budgetMin||0, budgetMax:+r.budgetMax||0 }));
    if(items.some(r=>r.qty<1)) return fail("Please enter a quantity (1 or more) for every item.");
    if(items.some(r=>r.budgetMin && r.budgetMax && r.budgetMin>r.budgetMax)) return fail("Budget minimum can't be higher than the maximum.");
    if(val("bkName").length<2) return fail("Please enter the contact person's name.");
    if(!/^\+?\d[\d\s-]{7,14}$/.test(val("bkPhone"))) return fail("Please enter a valid phone number.");
    if(val("bkEmail") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("bkEmail"))) return fail("Please enter a valid email address.");
    err.hidden = true;
    const body = { visitorId:Track.id, company:val("bkCompany"), city:val("bkCity"), items,
      customer:{ name:val("bkName"), phone:val("bkPhone"), email:val("bkEmail"), notes:val("bkNotes") } };
    const btn = document.getElementById("bkSubmit"), label = btn.innerHTML;
    btn.disabled = true; btn.querySelector("span").textContent = "Saving your enquiry…";
    let url, id = "";
    try{
      const r = await API.post("/api/bulk-enquiry", body, { retries:4, wake:true });
      url = r.whatsappUrl; id = r.enquiryId;
    }catch(ex){
      if(ex.status){ btn.disabled = false; btn.innerHTML = label; return fail(ex.message); }
      // backend unreachable: don't lose the lead - send a plain message on WhatsApp
      url = waLink(`*OFFICE BULK ENQUIRY*\n\nCompany: ${body.company||"-"}\nContact: ${body.customer.name}\nPhone: ${body.customer.phone}\n\n` +
        items.map(r=>`*${r.kind}*\nProduct: ${r.product||"-"}\nQuantity: ${r.qty}\nBudget: ${r.budgetMin||r.budgetMax?formatINR(r.budgetMin)+" - "+formatINR(r.budgetMax)+" each":"Open"}`).join("\n\n") +
        `\n\nDelivery Location: ${body.city||"-"}${body.customer.notes?"\n\nNotes: "+body.customer.notes:""}`);
      showToast("Server is busy - opening WhatsApp directly");
    }
    BULK_ROWS = [{ kind:"Chairs", product:"", qty:10, budgetMin:"", budgetMax:"" }];
    form.innerHTML = `<div class="lead-thanks"><div class="lead-tick">✓</div><h2>Enquiry received</h2>
      ${id?`<p class="lead-sub">Your enquiry ID is <strong>${id}</strong>.</p>`:""}
      <p class="lead-sub">WhatsApp is opening with your requirement. Tap <strong>Send</strong> there to confirm.</p>
      <a class="btn btn-wa" href="${url}" target="_blank" rel="noopener">${WA_ICON}<span>Open WhatsApp again</span></a>
      <a class="btn btn-ghost" href="/shop" style="margin-left:8px;">Keep browsing</a></div>`;
    waOpenUrl(url, "bulk");
  });
}
