POCKET AI - CLOUDFLARE FIX
==========================
This patch replaces the weak browser model with a Cloudflare Pages Function backed by Workers AI.

1. In your GitHub Pocketai repository, replace app.js with the included app.js.
2. Create the folder functions/api/ and upload chat.js there (the final path must be functions/api/chat.js).
3. Deploy the repository as a CLOUDFLARE PAGES project (not GitHub Pages). Set the production branch to main, framework preset None, build command empty, output directory / (root). If Cloudflare's UI requires an output directory, use the root folder or deploy a public folder containing the website files while keeping functions/ at the repository root.
4. In Cloudflare Pages project Settings > Bindings, add a Workers AI binding named AI. Redeploy after adding the binding.
5. Open the Cloudflare Pages URL. Verify /api/chat shows an API-online message, then test chat.
6. On iPhone, open the Cloudflare Pages URL in Safari and use Share > Add to Home Screen. Remove the old Home Screen shortcut if necessary.

Important: GitHub Pages cannot execute functions/api/chat.js. This is a Cloudflare Pages deployment only. Free tier quotas and available models may change. Never put API tokens in browser files or public GitHub repositories.
This code has not been deployed or live-tested with your Cloudflare account.
