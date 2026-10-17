# Security policy

CVForge is built to be safe to install and run:

- **Zero dependencies** and **no install scripts**: installing it never runs code or pulls in third-party packages.
- **Local only**: the CLI and studio make no network calls except to the local headless browser on `127.0.0.1`. The studio listens on `127.0.0.1` only and rejects cross-site requests and foreign `Host` headers.
- **Untrusted input is escaped**: resume text is HTML-escaped, and links are limited to `https`, `http`, `mailto` and `tel`, so a resume file can't inject scripts.
- **Web app**: a static site with a strict Content Security Policy; resumes stay in the browser's local storage.

## Reporting a vulnerability

Please report vulnerabilities privately through
[GitHub Security Advisories](https://github.com/bertini01/cv-builder/security/advisories/new)
rather than a public issue. You'll get a response within a few days.
