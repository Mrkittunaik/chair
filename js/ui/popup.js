/* ---------------- Mandatory lead popup ----------------
   Every new visitor must leave a name + valid Indian mobile number.
   - Shows immediately on load (no delay, no admin on/off, no backend needed to appear).
   - The X button only hides it for a moment: the next scroll / click / tap / key press
     brings it back, again and again, until a valid number is submitted.
   - Backdrop click and Escape do nothing.
   - Once submitted (K_DONE) it never shows again on that browser.                       */
const Popup = (()=>{
  const K_DONE="adil_popup_done", K_PENDING="adil_lead_pending";
  let el=null, hidden=false, hiddenAt=0, finished=false, interest="";
  const cfg = ()=> { try{ return (AdminStore.getSettings().popup) || {}; }catch(e){ return {}; } };

  /* Indian mobile: 10 digits, first digit 6-9. Accepts +91 / 91 / 0 prefix and spaces/dashes. Returns the 10 digits or null. */
  function cleanPhone(raw){
    let d = String(raw||"").replace(/[\s\-().]/g,"");
    if(!d || /[^\d+]/.test(d) || d.indexOf("+")>0) return null;
    if(d.startsWith("+")){ if(!d.startsWith("+91")) return null; d = d.slice(3); }
    else if(d.startsWith("0091")) d = d.slice(4);
    else if(d.length===12 && d.startsWith("91")) d = d.slice(2);
    else if(d.length===11 && d.startsWith("0")) d = d.slice(1);
    if(!/^[6-9]\d{9}$/.test(d)) return null;
    if(/^(\d)\1{9}$/.test(d)) return null;                 // 9999999999 etc.
    return d;
  }

  const isDone = ()=>{ try{ return !!localStorage.getItem(K_DONE); }catch(e){ return false; } };
  const markDone = ()=>{ try{ localStorage.setItem(K_DONE,"1"); }catch(e){} };

  /* lead saved locally when the server couldn't be reached; sent later */
  function flushPending(){
    let p=null; try{ p = JSON.parse(localStorage.getItem(K_PENDING)||"null"); }catch(e){}
    if(!p) return;
    API.post("/api/lead", Object.assign({visitorId:Track.id}, p), {retries:3})
      .then(()=>{ try{ localStorage.removeItem(K_PENDING); }catch(e){} })
      .catch(e=>{ if(e && e.status){ try{ localStorage.removeItem(K_PENDING); }catch(x){} } });
  }

  /* ---- hide (X) / re-show ---- */
  function hide(){
    if(!el || finished) return;
    hidden = true; hiddenAt = Date.now();
    el.classList.add("lead-hidden");
    document.body.classList.remove("pop-open");
  }
  function reshow(){
    if(!el || !hidden || finished) return;
    hidden = false;
    el.classList.remove("lead-hidden");
    document.body.classList.add("pop-open");
    Track.event("POPUP_REOPEN");
    const n = el.querySelector("#lpName"), p = el.querySelector("#lpPhone");
    const f = (n && !n.value) ? n : p; if(f) setTimeout(()=>f.focus({preventScroll:true}), 50);
  }
  function onInteract(e){
    if(!hidden || finished) return;
    if(Date.now()-hiddenAt < 350) return;                  // ignore the tail of the X click itself
    if(e.type==="click" || e.type==="keydown"){ e.preventDefault(); e.stopPropagation(); }
    reshow();
  }
  function bindReopen(){
    ["wheel","touchstart","touchmove","scroll"].forEach(t=> window.addEventListener(t, onInteract, {passive:true, capture:true}));
    ["click","keydown"].forEach(t=> document.addEventListener(t, onInteract, true));
  }
  function unbindReopen(){
    ["wheel","touchstart","touchmove","scroll"].forEach(t=> window.removeEventListener(t, onInteract, {capture:true}));
    ["click","keydown"].forEach(t=> document.removeEventListener(t, onInteract, true));
  }
  function finish(){
    finished = true; unbindReopen();
    if(el){ el.remove(); el=null; }
    document.body.classList.remove("pop-open");
  }

  function open(){
    if(el || finished || isDone()) return;
    const c = cfg(), interests = c.showInterest===false ? [] : (c.interests||[]);
    const prof = Track.draft();
    el = document.createElement("div");
    el.id = "leadPop"; el.className = "lead-pop"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","lpTitle");
    el.innerHTML = `
      <div class="lead-card">
        <button class="lead-x" type="button" aria-label="Close">${ICONS.close}</button>
        <div class="lead-body" id="lpBody">
          <span class="lead-eyebrow">Adil Furnitures</span>
          <h2 id="lpTitle">${escapeHtml(c.title||"Planning to Buy Furniture?")}</h2>
          <p class="lead-sub">${escapeHtml(c.description||"Get the best price for your requirement.")} Please enter your details to continue.</p>
          <form id="lpForm" novalidate>
            <div class="field"><label for="lpName">Name</label><input id="lpName" autocomplete="name" required value="${escapeHtml(prof.name||"")}"></div>
            <div class="field"><label for="lpPhone">Mobile number</label><input id="lpPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="17" placeholder="10-digit mobile number" required value="${escapeHtml(prof.phone||"")}"></div>
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
    bindReopen();

    el.addEventListener("click", e=>{
      if(e.target.closest(".lead-x")){ hide(); return; }
      if(e.target===el){ const card = el.querySelector(".lead-card"); card.classList.remove("lead-shake"); void card.offsetWidth; card.classList.add("lead-shake"); return; }   // backdrop: can't dismiss
      const ch = e.target.closest(".chip[data-i]");
      if(ch){ interest = ch.classList.contains("on") ? "" : ch.dataset.i; el.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===ch && !!interest)); }
    });
    el.addEventListener("keydown", e=>{ if(e.key==="Escape"){ e.preventDefault(); } });

    const err = el.querySelector("#lpErr");
    el.querySelector("#lpPhone").addEventListener("input", e=>{ e.target.value = e.target.value.replace(/[^\d+\s-]/g,""); });
    el.querySelector("#lpForm").addEventListener("submit", async e=>{
      e.preventDefault();
      const name = el.querySelector("#lpName").value.trim(), rawPhone = el.querySelector("#lpPhone").value.trim();
      const fail = m=>{ err.textContent = m; err.hidden = false; };
      if(name.length<2) return fail("Please enter your name.");
      if(!rawPhone) return fail("Please enter your mobile number.");
      const phone = cleanPhone(rawPhone);
      if(!phone) return fail("Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.");
      err.hidden = true;
      const btn = el.querySelector("#lpBtn"); btn.disabled = true; btn.textContent = "Sending…";
      const thanks = ()=>{
        markDone(); Object.assign(Track.profile,{name,phone});
        el.querySelector("#lpBody").innerHTML = `<div class="lead-thanks"><div class="lead-tick">✓</div><h2>Thank you!</h2><p class="lead-sub">Our team will contact you shortly.</p></div>`;
        el.querySelector(".lead-x").remove();
        finished = true; unbindReopen();                 // no more reopening; card closes itself below
        setTimeout(finish, 2200);
      };
      try{
        await API.post("/api/lead",{visitorId:Track.id, name, phone, interest},{retries:3});
        thanks();
      }catch(ex){
        if(ex && ex.status){                              // server answered with a rejection -> user must fix it
          btn.disabled = false; btn.textContent = c.cta||"Get Best Price";
          return fail(ex.message || "Please check your details and try again.");
        }
        /* server asleep / offline: keep the lead locally, let the visitor in, retry later */
        try{ localStorage.setItem(K_PENDING, JSON.stringify({name, phone, interest})); }catch(x){}
        thanks();
      }
    });
    setTimeout(()=>{ const n = el && el.querySelector("#lpName"); if(n && !n.value) n.focus({preventScroll:true}); }, 250);
  }

  /* called by Track.init once the server has answered: a number already on file means no popup */
  function arm(){
    if(finished) return;
    const ph = Track.profile && Track.profile.phone;
    if(ph && cleanPhone(ph)){ markDone(); finish(); return; }
    flushPending();
  }
  function schedule(){}                                   // kept for compatibility; popup no longer waits

  function start(){
    if(isDone()){ flushPending(); return; }
    open();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start); else start();

  return { arm, schedule, cleanPhone };
})();
