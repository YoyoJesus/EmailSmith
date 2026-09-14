# EmailSmith

EmailSmith is a browser-based email signature designer with a live preview and exports for rich email HTML, raw HTML, and Typst source.

[Try the deployed app](https://email.barknote.top)

## Features

- Build horizontal or stacked signatures with contact details, roles, social links, and an optional call to action.
- Customize fonts, colors, dividers, image shape, and sizing.
- Copy a rich signature for pasting into compatible email clients.
- Copy portable HTML or Typst source for further editing.
- Keep work between visits using browser storage.

## Privacy and storage

EmailSmith is a static SvelteKit application. Signature fields and uploaded profile images are processed in the browser and stored in that browser's `localStorage`; the project has no application server or database.

Browser storage is convenient, not a secure vault. Avoid entering secrets, and remember that clearing site data or using another browser removes access to saved signature data. A hosted image URL is generally more compatible with email clients than a browser-uploaded image embedded as a data URL.

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

The production target is Vercel with `web/` configured as the project root. SvelteKit uses the static adapter and writes the deployable site to `web/build/`. The fallback page supports client-side navigation.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and pull-request requirements. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), and follow the [Code of Conduct](CODE_OF_CONDUCT.md) when participating.

## License

EmailSmith is licensed under the [GNU General Public License v3.0](LICENSE).
