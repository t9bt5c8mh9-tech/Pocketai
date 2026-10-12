# Pocket Chat — experimental iPhone AI web app

This is a small original chat app, **not a copy of DadGPT**. It contains readable HTML, CSS and JavaScript with no bundled executable, no ads and no tracking code. It uses third-party open-source software and a public model; **no software can be guaranteed malware-free**.

## What's inside

- `index.html` — app screen
- `styles.css` — design, including iPhone sizing
- `app.js` — messaging UI, keeps your conversation in this tab only
- `functions/api/chat.js` — Cloudflare Pages Function that answers using Workers AI
- `manifest.webmanifest`, `icon.png`, `sw.js` — make it Home Screen-friendly

**Important:** This is real AI text generation, not a fake script. Replies come from a cloud model (Llama 3.1 8B via Cloudflare Workers AI), so they are far more natural and realistic than the old tiny in-browser model. It is *not* an installable `.ipa` file. It has **not been tested on a real iPhone**. An internet connection is required because the AI runs in the cloud, not on the device.

## Put it on an iPhone using Cloudflare Pages

The chat AI runs as a Cloudflare Pages Function, so the app must be deployed to **Cloudflare Pages**, not GitHub Pages (GitHub Pages cannot run `functions/api/chat.js`).

1. Sign in to Cloudflare and create a **Pages** project connected to this repository.
2. Set the production branch to `main`, framework preset **None**, build command **empty**, and output directory **/(root)**.
3. In the Pages project, go to **Settings → Bindings** and add a **Workers AI** binding named `AI`, then redeploy.
4. Open the Cloudflare Pages URL in Safari. Confirm `/api/chat` returns an "API online" message, then send a chat.
5. In Safari, tap **Share → Add to Home Screen** and confirm.

You cannot just run the ZIP as a native iOS app. Browsers can restrict JavaScript modules, caching and loading local files, so hosting it as an HTTPS site is recommended.

## Security and privacy

- No user login or password needed.
- Never asks for Apple ID, iPhone configuration profiles, an `.ipa`, special permissions or antivirus deactivation.
- Chat history stays in temporary browser memory, and is **not** stored by this app. Messages are sent to the Cloudflare Workers AI model to generate a reply, so the provider still processes those requests (such as IP information).
- Model source: Cloudflare Workers AI, `@cf/meta/llama-3.1-8b-instruct`.
- Inspect the app code before use. Models can be imperfect or give unsafe/inaccurate answers; don't rely on them for medical, legal or emergency advice.

## Troubleshooting

- If the chat will not respond: confirm the site is deployed on Cloudflare Pages, the Workers AI binding named `AI` exists, and you have redeployed since adding it. Open `/api/chat` to check for the "API online" message.
- The page shell may load offline once cached, but the AI needs an internet connection because it runs in the cloud.
- Cloudflare Pages can take some time to publish. Make sure the files are in the repository root and the binding is configured.

## License

This original app code is provided under the MIT license in `LICENSE.txt`. The Cloudflare Workers AI model has separate licenses, upstream terms and security considerations.
