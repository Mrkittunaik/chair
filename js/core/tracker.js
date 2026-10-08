/* ---------------- Visitor / cart / WhatsApp tracking ----------------
   First-party anonymous visitor id (no fingerprinting). Everything is fire-and-forget:
   tracking failures never break browsing.                                              */
const Track = (()=>{
  const VID="adil_vid", SID="adil_sid", SIDTS="adil_sid_ts", SESSION_MS=30*60*1000;
  const uuid = ()=> (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{ const r=Math.random()*16|0; return (c==="x"?r:(r&3|8)).toString(16); });
  const cookie = k => (document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"))||[])[1];
  let visitorId = null;
  try{ visitorId = localStorage.getItem(VID); }catch(e){}
  visitorId = visitorId || cookie(VID) || uuid();
  try{ localStorage.setItem(VID, visitorId); }catch(e){}
  document.cookie = VID+"="+visitorId+"; max-age="+(400*86400)+"; path=/; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"");

  function sessionId(){
    let s=null, ts=0;
    try{ s=sessionStorage.getItem(SID); ts=+sessionStorage.getItem(SIDTS)||0; }catch(e){}
    if(!s || Date.now()-ts > SESSION_MS) s = uuid();                 // refresh/reload keeps the same session; 30 min idle starts a new one
    try{ sessionStorage.setItem(SID,s); sessionStorage.setItem(SIDTS,String(Date.now())); }catch(e){}
    return s;
  }
  const T = { id: visitorId, profile:{}, ready:false };

  function send(path, body, opt){
    return API.whenReady().then(ok=> ok ? API.post(path, Object.assign({visitorId, sessionId:sessionId()}, body), Object.assign({retries:2, keepalive:true}, opt)) : null).catch(()=>null);
  }
  T.send = send;
  T.event = (type, extra)=> send("/api/track/event", Object.assign({type, page: pageKey()}, extra));

  /* one dedupe window so catalogue-refresh re-renders don't double count */
  let lastKey="", lastAt=0;
  T.onRoute = (route, id, params)=>{
    const key = pageKey();
    if(key===lastKey && Date.now()-lastAt<5000) return;
    lastKey=key; lastAt=Date.now();
    T.event("PAGE_VIEW");
    if(route==="product"){ const p = typeof findProduct==="function" ? findProduct(id) : null; T.event("PRODUCT_VIEW",{productId:id, category:p?(allCategoryLabels()[p.group]||p.group):""}); }
    else if(route==="shop" && params.cat) T.event("CATEGORY_VIEW",{category:(allCategoryLabels()[params.cat]||params.cat)});
    else if(route==="cart") T.event("CART_VIEW");
    else if(route==="checkout") T.event("CHECKOUT_START");
  };

  /* cart is mirrored to the server (prices are re-read server-side) */
  let cartTimer;
  T.syncCart = ()=>{ clearTimeout(cartTimer); cartTimer = setTimeout(()=>{
    const c = Store.getCart(); send("/api/track/cart",{items:Object.keys(c).map(id=>({id, qty:c[id]}))}); }, 600); };

  /* debounced auto-save of name / phone / email / address / notes (never one request per keystroke) */
  let pend={}, profTimer;
  T.saveProfile = (fields)=>{
    Object.assign(pend, fields);
    try{ localStorage.setItem("adil_draft", JSON.stringify(Object.assign(JSON.parse(localStorage.getItem("adil_draft")||"{}"), fields))); }catch(e){}
    clearTimeout(profTimer);
    profTimer = setTimeout(()=>{ const b=pend; pend={}; send("/api/track/profile", b); Object.assign(T.profile, b); }, 800);
  };
  T.draft = ()=>{ let d={}; try{ d=JSON.parse(localStorage.getItem("adil_draft")||"{}"); }catch(e){} return Object.assign({}, d, T.profile); };

  /* WhatsApp: fired (keepalive) right before the chat opens; never blocks the click */
  T.wa = (kind, pid)=>{ send("/api/track/whatsapp",{kind:kind||"general", productId:pid||"", page:pageKey()}); };

  T.init = async ()=>{
    const ok = await API.whenReady();
    if(!ok) return;
    try{
      const r = await API.post("/api/track/visit",{visitorId, sessionId:sessionId(), referrer:document.referrer||"", page:pageKey()},{retries:2});
      T.profile = r.profile || {}; T.returning = r.returning; T.popupShown = r.popupShown; T.ready = true;
      if(typeof Popup!=="undefined") Popup.arm();
      if(Store.cartCount()) T.syncCart();
    }catch(e){}
  };
  return T;
})();
