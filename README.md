# EmailSmith

EmailSmith is a browser-based email signature designer with a live preview and exports for rich email HTML, raw HTML, and Typst source.

[Try the deployed app](https://email.barknote.top)

## Features

- Build horizontal or stacked signatures with contact details, roles, social links, and an optional call to action.
- Customize fonts, colors, dividers, image shape, and sizing.
- Copy a rich signature for pasting into compatible email clients.
- Copy portable HTML or Typst source for further editing.
- Download the signature as an HTML file, a Typst file, or a PNG image.
- Preview approximations of dark mode, blocked images, and classic Outlook, with warnings for settings that common clients do not support.
- Follow short install steps for Gmail, Outlook, Apple Mail, and Thunderbird.
- Keep several named signatures (for example work and school) and switch between them.
- Export a signature as a JSON file and import it in another browser or share it as a team template.
- Enter social profiles as a username or a full URL.
- Keep work between visits using browser storage, and delete it from the More menu when you are done.

## Privacy and storage

EmailSmith is a static SvelteKit application. Signature fields and uploaded profile images are processed in the browser and stored in that browser's `localStorage`; the project has no application server or database. Uploaded photos are cropped to a square and resized to 300 pixels before they are saved so they fit within browser storage limits. If saving fails, for example because storage is full or blocked, the editor shows a warning. Export and import read and write JSON files on your device only.

Browser storage is convenient, not a secure vault. Avoid entering secrets, and remember that clearing site data or using another browser removes access to saved signature data. **More > Delete saved data** removes every saved signature and the footer preference this app saved in the current browser. Exported JSON files contain your signature details and any uploaded photo, so treat them as personal data. A hosted image URL is generally more compatible with email clients than a browser-uploaded image embedded as a data URL.

## Local development

Requirements:

- Node.js 22 or a compatible current LTS release
- npm

From the repository root:

```sh
cd web
npm install
npm run dev
```

### Commands

Run these from `web/`:

| Command           | Purpose                               |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the development server          |
| `npm run build`   | Create the static production build    |
| `npm run preview` | Preview a production build locally    |
| `npm test`        | Run the Vitest suite                  |
| `npm run check`   | Run Svelte and TypeScript diagnostics |
| `npm run lint`    | Check formatting with Prettier        |
| `npm run format`  | Format the application workspace      |

## Deployment

The production target is Vercel with `web/` configured as the project root. SvelteKit uses the static adapter and prerenders the single page to `web/build/index.html`. A Content-Security-Policy is generated at build time from `web/svelte.config.js`, and `web/vercel.json` adds anti-framing and other response headers.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and pull-request requirements. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), and follow the [Code of Conduct](CODE_OF_CONDUCT.md) when participating.

## License

EmailSmith is licensed under the [GNU General Public License v3.0](LICENSE).
