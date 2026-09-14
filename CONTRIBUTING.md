# Contributing

Thanks for helping improve EmailSmith. Contributions involving generated HTML, links, profile images, or browser persistence deserve particular care because email clients have inconsistent rendering and signatures commonly contain personal information.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Search existing issues and pull requests before opening a duplicate.
- Open an issue before a large feature, dependency change, or architectural change.
- Never include real contact details, private profile images, credentials, or browser-storage exports in an issue, fixture, screenshot, or commit.
- Use synthetic signature data in tests and examples.

## Local setup

The SvelteKit application lives in `web/` and requires Node.js 22 or a compatible current LTS release.

```sh
cd web
npm install
npm run dev
```

## Making changes

1. Fork the repository and create a focused branch from `main`. Changes reach `main` through pull requests.
2. Follow the project layout, architecture, privacy, and compatibility constraints below.
3. Add tests for new generator behavior, input boundaries, and failure paths.
4. Update documentation when behavior, storage, configuration, or browser support changes.

### Project layout

- The deployable SvelteKit application lives in `web/`; run Node and npm commands there.
- Shared browser code belongs in `web/src/lib/` and SvelteKit routes in `web/src/routes/`.
- Static browser assets belong in `web/static/`. Documentation and examples belong in `docs/`.
- The root `README.md` is canonical; `web/README.md` stays a short workspace pointer.

### Architecture and privacy

- EmailSmith is a static, browser-only application deployed to Vercel with `web/` as the project root. Do not add a database, server route, persistent filesystem dependency, background worker, or always-on backend without prior discussion.
- Signature data and uploaded profile images may use browser `localStorage`. Do not describe this as server-side persistence or secure storage.
- Treat names, email addresses, phone numbers, URLs, and images as personal data. Use synthetic data in tests, documentation, logs, and screenshots.
- Keep generated email HTML table-based and inline-styled where practical for email-client compatibility.
- Escape or validate user-provided text, URLs, and style values before including them in generated HTML or Typst source.

### Code and tests

- Use TypeScript and the Svelte 5 conventions already present in the repository.
- Keep deterministic generation and validation logic separate from browser APIs so it can be unit tested in Node.
- Add regression coverage for escaping, optional fields, URL normalization, layout variants, and fallback behavior.
- Keep interactive controls accessible with labels, keyboard support, visible focus, and appropriate announcements.
- Do not commit `.env` files, credentials, generated build output, dependency directories, or real signature data.

## Validation

Run these commands from `web/`:

```sh
npm test
npm run check
npm run lint
npm run build
```

On Windows, `npm run lint` may flag files you did not change because of CRLF line endings in the working tree. Run `npm run format`, then commit only the files your change actually touches.

## Commit messages

Every commit must use a one-line [Conventional Commit](https://www.conventionalcommits.org/) message:

```text
type(optional-scope): imperative description
```

Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`. Add `!` before the colon for a breaking change. Do not add a commit-message body or footer.

The pull-request workflow validates every commit in the PR. You can run the same check locally from the repository root, replacing `main` with the appropriate base ref when needed:

```sh
node .github/scripts/check-commit-messages.mjs main HEAD
```

## Pull requests

- Keep the change focused and explain the user-visible outcome.
- List the validation commands you ran and their results.
- Include screenshots or recordings for meaningful UI changes.
- Call out privacy, email-client compatibility, dependency-size, or Vercel deployment implications.
- Respond to review comments with either a fix or a concise technical explanation.

## AI attribution

If you wrote the pull request yourself, leave the `AI assistance: no` line from the template in place. For issues, enter `Not AI-generated` in the attribution field. Repository automation checks for this declaration.

Pull requests and issues prepared by an AI agent end with a provider, model, and harness footer instead. Agents add it themselves as instructed in `AGENTS.md`, so you do not need to write it.
