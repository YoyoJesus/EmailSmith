# Repository Guidelines

## Before opening a pull request

Copy the literal forms in this section. Do not paraphrase them.

- Run `npm test`, `npm run check`, `npm run lint`, and `npm run build` from `web/`. Every one must pass before you push.
- If `npm run lint` flags files you did not touch, that is a CRLF working-tree artifact on Windows, not a repository baseline to disclose and move past. Run `npm run format`, then commit only the files your change actually touches.
- Open the pull request from a branch. Never push to `main`.

Every commit message is exactly one line, with no body and no footer:

```text
fix(html): escape generated link attributes
```

Use this pull request body verbatim. Keep every heading, replace each HTML comment with your own text, tick the boxes you completed, and keep the attribution footer as the final three lines:

```markdown
## Summary

<!-- What changed, and what user or contributor problem does it solve? -->

## Verification

<!-- List the commands and manual checks you ran, with their results. -->

- [ ] `npm test`
- [ ] `npm run check`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] I added or updated tests for changed behavior.
- [ ] I included screenshots or recordings for meaningful UI changes, or marked this not applicable below.

## Risk and deployment

<!-- Note privacy, email-client compatibility, dependency-size, migration, or Vercel implications. Write "None" if not applicable. -->

## Checklist

- [ ] My changes are focused and follow `CONTRIBUTING.md`.
- [ ] I updated relevant documentation.
- [ ] I used synthetic test data and did not commit secrets or personal signature information.
- [ ] I reviewed the diff for unrelated generated or formatting changes.

AI assistance: yes

Agent provider: PROVIDER_NAME
Agent model: MODEL_NAME
Agent harness: HARNESS_NAME
```

Replace `PROVIDER_NAME`, `MODEL_NAME`, and `HARNESS_NAME` with the values actually used, for example `OpenAI`, `GPT-6`, and `Codex`. Write plain values with no angle brackets; validation rejects `<` and `>`. The three footer lines must be the last lines of the body, in that order. The template's `AI assistance: no` line and its comment are for humans; replace them with the block above. The footer is your responsibility: the template has no checkbox for it, and humans are not expected to add it for you. For issues, replace the prefilled `Not AI-generated` attribution field with the same three-line footer.

`CONTRIBUTING.md` holds the human-facing version of the guidelines below. When you change a guideline here, update it there too.

Creating a pull request through the GitHub API, `gh pr create`, or an agent integration does not apply `.github/pull_request_template.md`. That is why the body above is reproduced here; supply it explicitly with `gh pr create --body-file`.

## Project layout

- The deployable SvelteKit application lives in `web/`; run Node and npm commands there.
- Shared browser code belongs in `web/src/lib/` and SvelteKit routes in `web/src/routes/`.
- Static assets belong in `web/static/`. Documentation and examples belong in `docs/`.
- Root community files and `.github/` contain public project policy and contribution templates. Keep the root `README.md` canonical; `web/README.md` remains a short workspace pointer.

## Development workflow

- Use npm and the committed `web/package-lock.json`.
- Install dependencies with `npm install` from `web/`.
- Use `npm run dev` for local development, `npm test` for Vitest, `npm run check` for Svelte/TypeScript diagnostics, and `npm run lint` for formatting checks.
- Before committing, run focused tests, then `npm test`, `npm run check`, `npm run lint`, and `npm run build`.
- Preserve unrelated user changes and keep commits focused.
- Write every commit message as exactly one line in Conventional Commits format: `type(optional-scope): imperative description`. Allowed types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`; add `!` before the colon for a breaking change. Do not add a commit-message body or footer.
- Never push directly to `main`; always use a branch and pull request.
- Issues and pull requests submitted by an agent must end with the exact provider/model/harness footer documented above.

## Architecture and privacy

- EmailSmith is a static SvelteKit application deployed to Vercel with `web/` as the project root. Do not add server routes, a database, persistent filesystem dependency, background worker, or always-on backend without explicit approval.
- Signature data and uploaded profile images may use browser `localStorage`. Do not describe it as server-side persistence or secure storage.
- Treat signature fields and images as personal data. Use synthetic values in tests, docs, screenshots, and logs.
- Keep generated email HTML table-based and inline-styled where practical for broad email-client compatibility.
- Escape or validate user-controlled text, URLs, and style values before including them in generated HTML or Typst.

## Code and tests

- Use TypeScript and the Svelte 5 conventions already present in the repository.
- Keep deterministic generation and validation logic separate from browser APIs so it can be unit tested in Node.
- Add regression coverage for escaping, optional fields, URL normalization, layout variants, input boundaries, and fallback behavior.
- Maintain accessible controls with labels, keyboard support, visible focus, and appropriate announcements.
- Keep privacy and storage claims synchronized across code, tests, and the root README.
- Do not commit `.env` files, credentials, generated build output, dependency directories, or real signature data.
