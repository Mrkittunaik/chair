/* ---------------- WhatsApp ordering ----------------
   Every enquiry (single product, cart, bulk, custom, contact) opens a
   pre-filled WhatsApp chat with the store number below.               */
let WA_NUMBER = "919959334110";          // +91 99593 34110 (digits only, with country code)
let WA_DISPLAY = "+91 99593 34110";
let WA_BRAND = "Adil Furnitures";
const SITE_URL = "https://adilfurnitures.com";                        // set to the live domain, e.g. "https://adilfurnitures.com" (blank = current address)

/* number / brand come from Admin > Settings (SiteSettings.whatsappNumber) once the catalogue has loaded */
function waSync(){
  const st = AdminStore.getSettings();
  if(st.whatsappNumber) WA_NUMBER = st.whatsappNumber.replace(/\D/g,"");
  if(st.phone) WA_DISPLAY = st.phone;
  if(st.siteName) WA_BRAND = st.siteName;
}
function siteBase(){
  if(SITE_URL) return SITE_URL.replace(/\/+$/, "") + "/";
  return location.origin + location.pathname;
}
function productUrl(p){ return siteBase().replace(/\/$/,"") + productPath(p); }
function waLink(text){ return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }
/* Tracks the click first (keepalive request, not awaited so the popup isn't blocked), then opens WhatsApp. */
function waOpenUrl(url, kind, pid){
  if(typeof Track!=="undefined") Track.wa(kind, pid);
  // NB: don't pass "noopener" here - it makes window.open() return null even on success
  const w = window.open(url, "_blank");
  if(w){ try{ w.opener = null; }catch(e){} }
  else location.href = url;                  // popup blocked -> same tab
}
function waOpen(text, kind, pid){ waOpenUrl(waLink(text), kind||"general", pid); }

function waLine(p, qty){
  return `*${p.name}*\nPrice: ${formatINR(p.price)}\nQuantity: ${qty}\nAmount: ${formatINR(p.price*qty)}\nLink: ${productUrl(p)}`;
}
function waProductMsg(p, qty){
  return `Hello ${WA_BRAND}, I want to order this:\n\n${waLine(p, qty||1)}\n\nPlease confirm availability and delivery.`;
}
function waBulkMsg(p, qty){
  const head = p
    ? `Hello ${WA_BRAND}, I need a *bulk order* quote for:\n\n*${p.name}*\nUnit price: ${formatINR(p.price)}\nQuantity needed: ${qty||"____"}\nLink: ${productUrl(p)}`
    : `Hello ${WA_BRAND}, I need a *bulk order* quote.\n\nItems: ____\nQuantity: ____\nCity: ____`;
  return head + "\n\nPlease share your best price.";
}
function waCustomMsg(p){
  const head = p
    ? `Hello ${WA_BRAND}, I want to *customise* this piece:\n\n*${p.name}*\nPrice (standard): ${formatINR(p.price)}\nLink: ${productUrl(p)}\n\nSize / colour / material changes: ____`
    : `Hello ${WA_BRAND}, I want a *custom-made* piece.\n\nWhat I need: ____\nSize: ____\nColour / material: ____`;
  return head + "\n\nPlease let me know the price and timeline.";
}
function waCartMsg(customer){
  const cart = Store.getCart();
  const items = Object.keys(cart).map(id=>findProduct(id)).filter(Boolean);
  const s = AdminStore.getSettings();
  const sub = Store.cartTotal();
  const ship = sub >= s.freeShipThreshold ? 0 : s.shipCost;
  let m = `Hello ${WA_BRAND}, I want to place this order:\n\n`;
  m += items.map((p,i)=>`${i+1}. ${waLine(p, cart[p.id])}`).join("\n\n");
  m += `\n\nSubtotal: ${formatINR(sub)}\nDelivery: ${ship? formatINR(ship) : "Free"}\n*Total: ${formatINR(sub+ship)}*`;
  if(customer){
    m += `\n\n*Delivery details*\nName: ${customer.name}\nPhone: ${customer.phone}`;
    if(customer.email) m += `\nEmail: ${customer.email}`;
    m += `\nAddress: ${customer.address}`;
    if(customer.notes) m += `\nNotes: ${customer.notes}`;
  }
  return m;
}
function waOrderMsg(order){
  let m = `Hello ${WA_BRAND}, I placed order *${order.id}*:\n\n`;
  m += order.items.map((it,i)=>{
    const p = findProduct(it.id);
    return `${i+1}. *${it.name}*\nPrice: ${formatINR(it.price)}\nQuantity: ${it.qty}\nAmount: ${formatINR(it.price*it.qty)}` + (p? `\nLink: ${productUrl(p)}` : "");
  }).join("\n\n");
  m += `\n\nSubtotal: ${formatINR(order.subtotal)}\nDelivery: ${order.shipping? formatINR(order.shipping) : "Free"}\n*Total: ${formatINR(order.total)}*`;
  const c = order.customer;
  m += `\n\n*Delivery details*\nName: ${c.name}\nPhone: ${c.phone}`;
  if(c.email) m += `\nEmail: ${c.email}`;
  m += `\nAddress: ${c.address}`;
  if(c.notes) m += `\nNotes: ${c.notes}`;
  return m;
}

const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>`;

/* Delegated click handler: any element with data-wa="product|bulk|custom|cart|general" */
document.addEventListener("click", e=>{
  const el = e.target.closest("[data-wa]");
  if(!el) return;
  e.preventDefault();
  const kind = el.dataset.wa;
  const p = el.dataset.pid ? findProduct(el.dataset.pid) : null;
  const qty = el.dataset.qty ? parseInt(el.dataset.qty,10) : (window.__pdpQty || 1);
  let msg;
  if(kind==="product" && p) msg = waProductMsg(p, qty);
  else if(kind==="bulk") msg = waBulkMsg(p, qty>1 ? qty : "");
  else if(kind==="custom") msg = waCustomMsg(p);
  else if(kind==="cart") msg = waCartMsg();
  else msg = `Hello ${WA_BRAND}, I have a question.`;
  waOpen(msg, kind, p ? p.id : "");
});
waSync();
