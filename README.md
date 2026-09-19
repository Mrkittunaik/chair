# PRABOT. — Furniture Store

A client-side single-page app (hash-router, no build step) for a furniture
storefront with a built-in admin panel. Originally shipped as one 2,800-line
`index.html`; this is the same app split into a proper folder structure with
no behavior changes.

## Structure

```
.
├── index.html                 # App shell: loads CSS + JS in order, mounts #app
├── css/
│   └── style.css              # All site styles (was inline <style>)
├── js/
│   ├── data/
│   │   └── products.js        # IMG map, PRODUCTS catalogue, categories,
│   │                           #   AdminStore (localStorage layer), cart/wishlist Store
│   ├── ui/
│   │   ├── icons-nav.js       # SVG icon strings + nav config
│   │   └── layout.js          # Header/footer render, toast, product cards, grid
│   ├── views/
│   │   ├── search.js          # Search results view
│   │   ├── home.js            # Homepage view
│   │   ├── shop.js            # Shop / category listing view
│   │   ├── product.js         # Single product page view
│   │   ├── cart-checkout.js   # Cart, checkout, order-confirmed views
│   │   ├── misc.js            # Wishlist, About, Contact, 404 views
│   │   └── admin/
│   │       └── admin.js       # Admin login + full admin panel (dashboard,
│   │                           #   orders, products, categories, homepage, settings)
│   └── core/
│       └── app.js             # Hash router, scroll-reveal animation, boot
└── pages/
    └── admin-guide.html       # Standalone static reference page for admin
                                #   (links into index.html#/admin, not a real route)
```

## How it works

- **No build tools, no bundler** — every JS file is loaded via a plain
  `<script src="...">` tag in `index.html`, in dependency order. All
  functions/consts stay in global scope exactly like the original file, so
  nothing needed to be rewritten — just relocated.
- **Routing**: `js/core/app.js` reads `location.hash`, matches a route
  (`home`, `shop`, `product`, `cart`, `checkout`, `admin`, etc.) and renders
  the matching view function's HTML string into `#app`.
- **Data/persistence**: products ship hardcoded in `js/data/products.js`;
  anything created/edited via the admin panel (products, categories, orders,
  homepage content, settings) is layered on top via `localStorage`
  (`AdminStore`). There is no backend/server.
- **Admin panel**: reachable at `index.html#/admin` inside the SPA — this is
  the real, working admin UI. `pages/admin-guide.html` is just a separate
  marketing/help page describing what's in there; it is not part of the
  router.

## Load order (must be preserved if you add files)

1. `js/data/products.js`
2. `js/ui/icons-nav.js`
3. `js/ui/layout.js`
4. `js/views/*.js` (any order between them, `admin/admin.js` included)
5. `js/core/app.js` **last** — it calls `render()` on load and wires up
   `hashchange`.

## Running locally

No build step — just serve the folder statically, e.g.:

```
npx serve .
# or
python3 -m http.server
```

Then open `index.html` in the browser.
