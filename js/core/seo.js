/* ---------------- Per-page SEO (title, description, product schema) ----------------
   Runs after every route render. Static defaults live in index.html. */
const SEO_BRAND = "Adil Furnitures";
const SEO_ORIGIN = "https://adilfurnitures.com";   // keep in sync with canonical in index.html

function seoSet(sel, attr, val){
  const el = document.head.querySelector(sel);
  if(el) el.setAttribute(attr, val);
}
function seoClean(t, n){
  t = String(t||"").replace(/\s+/g," ").trim();
  return t.length > n ? t.slice(0, n-1).trimEnd() + "…" : t;
}

function applySEO(route, id, params){
  let title = "Office Chairs, Desks & Furniture in Hyderabad | " + SEO_BRAND;
  let desc  = "Buy office chairs, ergonomic chairs, gaming chairs, desks, sofas and beds in Hyderabad. Workshop-made furniture with delivery and installation. Order on WhatsApp.";
  let ld = null;

  try{
    if(route === "shop"){
      const labels = allCategoryLabels();
      const name = params.cat && labels[params.cat] ? labels[params.cat] : "All Furniture";
      title = name + " — Buy Online in Hyderabad | " + SEO_BRAND;
      desc  = "Shop " + name.toLowerCase() + " at " + SEO_BRAND + ": chairs, desks, tables and more with delivery and installation in Hyderabad.";
    }else if(route === "product"){
      const p = findProduct(id);
      if(p){
        title = p.name + " — " + p.category + " | " + SEO_BRAND;
        desc  = seoClean(p.name + ". " + p.desc, 158);
        const img = /^https?:/.test(p.img) ? p.img : SEO_ORIGIN + "/" + String(p.img).replace(/^\//,"");
        ld = {
          "@context":"https://schema.org", "@type":"Product",
          name:p.name, description:seoClean(p.desc, 300), image:img,
          category:p.category, material:p.material, color:p.color,
          brand:{ "@type":"Brand", name:SEO_BRAND },
          offers:{
            "@type":"Offer", priceCurrency:"INR", price:String(p.price),
            availability: p.stockStatus === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            seller:{ "@type":"Organization", name:SEO_BRAND }
          }
        };
      }
    }else if(route === "about"){
      title = "About Us — Furniture Workshop in Hyderabad | " + SEO_BRAND;
      desc  = "Adil Furnitures is a Hyderabad furniture workshop making chairs, desks, sofas and beds for homes and offices since 2016.";
    }else if(route === "contact"){
      title = "Contact & Workshop Location — Hyderabad | " + SEO_BRAND;
      desc  = "Contact Adil Furnitures in Hyderabad by phone or WhatsApp for quotes, delivery and installation of chairs, desks and furniture.";
    }else if(route === "bulk"){
      title = "Bulk Office Furniture Orders — Hyderabad | " + SEO_BRAND;
      desc  = "Bulk enquiries for office chairs, desks and workstations in Hyderabad. Get a quote from Adil Furnitures.";
    }else if(route === "search"){
      title = (params.q ? "Search: " + params.q : "Search") + " | " + SEO_BRAND;
    }
  }catch(e){ /* never let SEO break rendering */ }

  document.title = title;
  seoSet('meta[name="description"]', "content", desc);
  seoSet('meta[property="og:title"]', "content", title);
  seoSet('meta[property="og:description"]', "content", desc);
  seoSet('meta[name="twitter:title"]', "content", title);
  seoSet('meta[name="twitter:description"]', "content", desc);

  /* cart/checkout/wishlist/search are not useful search results */
  const noindex = ["cart","checkout","wishlist","search"].includes(route);
  seoSet('meta[name="robots"]', "content", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");

  let tag = document.getElementById("ld-product");
  if(tag) tag.remove();
  if(ld){
    tag = document.createElement("script");
    tag.type = "application/ld+json"; tag.id = "ld-product";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  }
}
