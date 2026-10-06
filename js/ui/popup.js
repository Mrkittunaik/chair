/* ---------------- Lead popup (shows once the visitor has been on the site ~5s) ---------------- */
const Popup = (()=>{
  const LOADED = Date.now(), K_AT="adil_popup_at", K_DONE="adil_popup_done";
  let armed=false, shown=false;
  const cfg = ()=> (AdminStore.getSettings().popup) || {};
  function eligible(){
    const c = cfg();
    if(!c.enabled || shown) return false;
    if(/^#\/(checkout|bulk)/.test(location.hash)) return false;
    try{
      if(localStorage.getItem(K_DONE)) return false;
      const at = +localStorage.getItem(K_AT)||0;
      if(at && Date.now()-at < (c.frequencyHours||72)*3600*1000) return false;     // frequency control
    }catch(e){}
    if(Track.profile && Track.profile.phone) return false;                           // already left a number
    return true;
  }
  function arm(){
    armed = true; schedule();
  }
  function schedule(){
    if(!armed || shown || !CATALOG) return;                                           // needs server settings (admin-configurable)
    const wait = Math.max(0, (cfg().delaySeconds||5)*1000 - (Date.now()-LOADED));
    setTimeout(()=>{ if(eligible()) open(); }, wait);
  }
  function close(remember){
    const m = document.getElementById("leadPop"); if(m) m.remove();
    document.body.classList.remove("pop-open");
    if(remember!==false){ try{ localStorage.setItem(K_AT, String(Date.now())); }catch(e){} }
  }
  function open(){
    shown = true;
    const c = cfg(), interests = c.showInterest===false ? [] : (c.interests||[]);
    const prof = Track.draft();
    const el = document.createElement("div");
    el.id = "leadPop"; el.className = "lead-pop"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","lpTitle");
    el.innerHTML = `
      <div class="lead-card">
        <button class="lead-x" type="button" aria-label="Close">${ICONS.close}</button>
        <div class="lead-body" id="lpBody">
          <span class="lead-eyebrow">Adil Furnitures</span>
          <h2 id="lpTitle">${escapeHtml(c.title||"Planning to Buy Furniture?")}</h2>
          <p class="lead-sub">${escapeHtml(c.description||"Get the best price for your requirement.")}</p>
          <form id="lpForm" novalidate>
            <div class="field"><label for="lpName">Name</label><input id="lpName" autocomplete="name" required value="${escapeHtml(prof.name||"")}"></div>
            <div class="field"><label for="lpPhone">Mobile number</label><input id="lpPhone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile number" required value="${escapeHtml(prof.phone||"")}"></div>
            ${interests.length ? `<div class="field"><label>Interested in <span class="opt">(optional)</span></label>
              <div class="lead-chips" id="lpChips">${interests.map(i=>`<button type="button" class="chip" data-i="${escapeHtml(i)}">${escapeHtml(i)}</button>`).join("")}</div></div>` : ""}
            <p class="lead-err" id="lpErr" role="alert" hidden></p>
            <button class="btn btn-primary btn-block" type="submit" id="lpBtn">${escapeHtml(c.cta||"Get Best Price")}</button>
            <p class="lead-fine">By submitting, you agree to be contacted about your enquiry. We only use your details for this.</p>
          </form>
        </div>
      </div>`;
    document.body.appendChild(el); document.body.classList.add("pop-open");
    Track.event("POPUP_OPEN");
    let interest = "";
    el.addEventListener("click", e=>{
      if(e.target===el || e.target.closest(".lead-x")) close();
      const ch = e.target.closest(".chip[data-i]");
      if(ch){ interest = ch.classList.contains("on") ? "" : ch.dataset.i; el.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===ch && !!interest)); }
    });
    document.addEventListener("keydown", function esc(e){ if(e.key==="Escape"){ close(); document.removeEventListener("keydown",esc); } });
    const err = el.querySelector("#lpErr");
    el.querySelector("#lpForm").addEventListener("submit", async e=>{
      e.preventDefault();
      const name = el.querySelector("#lpName").value.trim(), phone = el.querySelector("#lpPhone").value.trim();
      const fail = m=>{ err.textContent = m; err.hidden = false; };
      if(name.length<2) return fail("Please enter your name.");
      if(!/^\+?\d[\d\s-]{7,14}$/.test(phone)) return fail("Please enter a valid mobile number.");
      err.hidden = true;
      const btn = el.querySelector("#lpBtn"); btn.disabled = true; btn.textContent = "Sending…";
      try{
        await API.post("/api/lead",{visitorId:Track.id, name, phone, interest},{retries:3});
        try{ localStorage.setItem(K_DONE,"1"); }catch(e){}
        Object.assign(Track.profile,{name,phone});
        el.querySelector("#lpBody").innerHTML = `<div class="lead-thanks"><div class="lead-tick">✓</div><h2>Thank you!</h2><p class="lead-sub">Our team will contact you shortly.</p></div>`;
        setTimeout(()=>close(false), 3200);
      }catch(ex){
        btn.disabled = false; btn.textContent = c.cta||"Get Best Price";
        fail(ex.status ? ex.message : "Couldn't reach the server. Please try again in a moment.");
      }
    });
    setTimeout(()=>{ const n = el.querySelector("#lpName"); if(n && !n.value) n.focus({preventScroll:true}); }, 250);
  }
  return { arm, schedule };
})();
