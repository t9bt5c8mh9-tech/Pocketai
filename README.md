# Pocket Chat — experimental iPhone AI web app

This is a small original chat app, **not a copy of DadGPT**. It contains readable HTML, CSS and JavaScript with no bundled executable, no ads and no tracking code. It uses third-party open-source software and a public model; **no software can be guaranteed malware-free**.

## What's inside

- `index.html` — app screen
- `styles.css` — design, including iPhone sizing
- `app.js` — messaging UI, talks to the cloud AI endpoint, keeps your conversation in this tab only
- `functions/api/chat.js` — Cloudflare Pages Function that answers `/api/chat` using Workers AI
- `wrangler.toml` — declares the Workers AI binding (`AI`) so deployments include it automatically
- `ai-worker.js` — legacy: downloads and runs a small chat AI in the browser (not used by `app.js` as shipped)
- `manifest.webmanifest`, `icon.png`, `sw.js` — make it Home Screen-friendly

**Important:** The app expects the Cloudflare backend described below. It is *not* an installable `.ipa` file. It has **not been tested on a real iPhone**.

## Put it on an iPhone using Cloudflare Pages

GitHub Pages cannot run `functions/api/chat.js`; deploy to **Cloudflare Pages** instead.

1. Sign in to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git** and select this repository.
2. Set production branch **main**, framework preset **None**, build command **empty**, output directory **/** (root), then **Save and Deploy**.
3. The Workers AI binding named `AI` is declared in `wrangler.toml`, so deployments include it. If you deploy a different way (e.g. direct upload without wrangler.toml), add it manually instead: project **Settings → Bindings → Add → Workers AI**, variable name exactly `AI`, then redeploy.
4. Open the project's `*.pages.dev` URL — the status line should say **Cloud AI ready**. You can also visit `/api/chat` directly to see the API-online message.
5. In Safari on the iPhone, open that URL, tap **Share → Add to Home Screen** and confirm.

You cannot just run the ZIP as a native iOS app. Browsers can restrict JavaScript modules, caching and loading local files, so hosting it as an HTTPS site is recommended.

## Security and privacy

- No user login or password needed.
- Never asks for Apple ID, iPhone configuration profiles, an `.ipa`, special permissions or antivirus deactivation.
- Chat history stays in temporary browser memory, and is **not** uploaded by this app. Third-party providers still receive requests for the library and model downloads (such as IP information).
- Source of script: `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1`
- Model source: `https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`
- Inspect those dependencies and app code before use. Models can be imperfect or give unsafe/inaccurate answers; don't rely on them for medical, legal or emergency advice.

## Troubleshooting

- If the model crashes or won't load: use the latest iOS/Safari, close other tabs, try Wi-Fi and reload. On older iPhones the model may never fit in available memory.
- The page shell may load offline once cached, but a reliable offline AI experience is **not guaranteed** because some library/model resources are third-party downloads.
- GitHub Pages can take some time to publish. Make sure the files are in the repository root and GitHub Pages is enabled.

## License

This original app code is provided under the MIT license in `LICENSE.txt`. The Hugging Face model and Transformers.js code have separate licenses, upstream terms and security considerations.
