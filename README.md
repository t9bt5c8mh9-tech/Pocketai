# Pocket Chat — experimental iPhone AI web app

This is a small original chat app, **not a copy of DadGPT**. It contains readable HTML, CSS and JavaScript with no bundled executable, no ads and no tracking code. It uses third-party open-source software and a public model; **no software can be guaranteed malware-free**.

## What's inside

- `index.html` — app screen
- `styles.css` — design, including iPhone sizing
- `app.js` — messaging UI and plain-text file attachments
- `ai-worker.js` — downloads and runs a small chat AI in the browser
- `manifest.webmanifest`, `icon.png`, `sw.js` — make it Home Screen-friendly

**Important:** This is real AI text generation, not a fake script, but the model is extremely small and its responses may be bad, inaccurate or very slow. It is *not* an installable `.ipa` file. It has **not been tested on a real iPhone**. Safari/iPhone hardware can refuse to load the model because of memory limits. The first download uses roughly 180 MB for model weights plus other files. Use Wi-Fi.

## Put it on an iPhone using GitHub Pages

1. Unzip the Pocket Chat ZIP in the Files app, or on a computer.
2. Sign in to GitHub at https://github.com and make a new **public** repository named `pocket-chat` (or a different name). Do not upload passwords, personal data or secret API keys.
3. Upload all seven project files **directly into the root** of that repository, not the containing folder. The required entry file is `index.html`.
4. Go to your repository **Settings → Pages**. Under **Build and deployment**, set **Deploy from a branch**, branch **main**, folder **/(root)**, then save.
5. When GitHub Pages publishes, open `https://YOUR-GITHUB-USERNAME.github.io/pocket-chat/` in Safari. (Change the username and repo name.)
6. In Safari, tap **Share → Add to Home Screen** and confirm.
7. Open Pocket Chat and tap **Load AI model** while on Wi-Fi. The browser will fetch code from jsDelivr and the model from Hugging Face.

You cannot just run the ZIP as a native iOS app. Browsers can restrict JavaScript modules, caching and loading local files, so hosting it as an HTTPS site is recommended.

## Security and privacy

- No user login or password needed.
- Never asks for Apple ID, iPhone configuration profiles, an `.ipa`, special permissions or antivirus deactivation.
- Chat history stays in temporary browser memory. Messages and attached text are sent to the Cloudflare Workers AI endpoint configured for this app so it can generate responses. Attachments are limited to TXT, MD, CSV, JSON, and LOG files up to 256 KB; the first 5,000 characters are included. Avoid uploading sensitive information. Cloudflare processes those requests under its own terms.
- Source of script: `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1`
- Model source: `https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`
- Inspect those dependencies and app code before use. Models can be imperfect or give unsafe/inaccurate answers; don't rely on them for medical, legal or emergency advice.

## Troubleshooting

- If the model crashes or won't load: use the latest iOS/Safari, close other tabs, try Wi-Fi and reload. On older iPhones the model may never fit in available memory.
- The page shell may load offline once cached, but a reliable offline AI experience is **not guaranteed** because some library/model resources are third-party downloads.
- GitHub Pages can take some time to publish. Make sure the files are in the repository root and GitHub Pages is enabled.

## License

This original app code is provided under the MIT license in `LICENSE.txt`. The Hugging Face model and Transformers.js code have separate licenses, upstream terms and security considerations.
