# Invoice Generator

React + Node app that creates a one-page signed PDF invoice. No auth, no database.

## Features

- Enter customer details
- Select products and quantities
- Draw or upload a signature (stored in **localStorage**)
- Generate a branded PDF from **Vikas Pvt. Ltd.**

### Signature storage

Yes — the signature is saved as a base64 PNG in `localStorage`. It persists across page reloads in the same browser until you:

- Click **Clear saved** in the app, or
- Clear site data / cookies / cache for this origin in the browser

`localStorage` is not a cookie, but clearing browsing data for the site usually removes it.

## Quick start

```bash
# From project root
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  

Or run separately:

```bash
npm run server
npm run client
```

## Flow

1. Save your signature (draw or upload)
2. Enter customer details
3. Select products
4. Download the PDF invoice
