# Pocket Chat

Pocket Chat is a browser-based chat app with an internet-connected Cloudflare Workers AI backend.

## Features

- Responsive assistant-style chat interface with suggested prompts.
- Attach TXT, MD, CSV, JSON, or LOG files up to 256 KB. The browser reads plain text and includes up to the first 5,000 characters in your next message.
- Chat requests are sent to Cloudflare Workers AI using `@cf/meta/llama-3.1-8b-instruct`.

## Deploy with Cloudflare Pages

1. Connect this repository to a Cloudflare Pages project.
2. Set the build command to none and the output directory to the repository root (`/`).
3. In the Pages project settings, add a Workers AI binding named `AI`.
4. Deploy. The `functions/api/chat.js` function handles requests to `/api/chat`.
5. Open the deployed HTTPS site. On iPhone, use Safari's **Share → Add to Home Screen** if desired.

GitHub Pages can serve the static UI but cannot run this Cloudflare Pages Function. The chat requires the Cloudflare Pages deployment and an internet connection.

## Privacy and safety

- No login is required. Conversation history stays in the current browser tab.
- Messages and attached text are sent over the internet to the configured Cloudflare Workers AI endpoint to generate responses. Avoid sharing sensitive information and review Cloudflare's terms and privacy information.
- The assistant should not help create, alter, or imitate realistic government IDs or driver's licenses. For fictional props, use a clearly visible “NOT A REAL ID” marking.
- AI responses may be inaccurate; do not rely on them for medical, legal, or emergency advice.

## License

This original app code is provided under the MIT license in `LICENSE.txt`. Cloudflare Workers AI and its model are subject to their own terms.
