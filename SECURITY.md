# Security Policy

## Supported versions

Security fixes are applied to the latest code on `main` and the current production deployment. Older commits, forks, and unmaintained deployments are not supported.

## Reporting a vulnerability

Please report vulnerabilities privately using [GitHub's security-advisory form](https://github.com/YoyoJesus/email-signature-maker/security/advisories/new). Do not open a public issue for a vulnerability that could expose personal information, browser-stored data, credentials, or deployment infrastructure.

Include, when possible:

- A clear description of the vulnerability and its impact.
- Reproduction steps or a minimal proof of concept.
- Affected files, browser versions, email clients, or deployments.
- Any suggested remediation.

Use synthetic data. Never attach real contact details, private profile images, credentials, or browser-storage contents.

The maintainer will aim to acknowledge a report within seven days, investigate it, and coordinate disclosure after a fix is available. Please allow a reasonable remediation period before public disclosure.

## Security boundaries

- EmailSmith is designed as a static browser application and should not transmit signature data to an application server.
- Signature data and uploaded profile images are stored in browser `localStorage`; browser storage is not a secure vault.
- Generated HTML and Typst must escape or validate user-controlled values before placing them into text, attributes, or styles.
- External profile-image and link URLs are loaded or opened by browsers and email clients; contributors must not assume they are trusted.
