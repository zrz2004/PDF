# Security Policy

## Reporting a Vulnerability

LocalPDF Studio runs **fully locally** — your files never leave your machine, and
no data is sent to any server. We still take security seriously.

If you discover a security vulnerability, please **do not open a public issue**.
Instead, report it privately:

- Open a private security advisory on GitHub:
  [github.com/zrz2004/PDF/security/advisories/new](https://github.com/zrz2004/PDF/security/advisories/new)
- Or email the maintainer via the profile listed on the repository.

Please include:
- A clear description of the issue and its impact.
- Steps to reproduce (proof of concept if possible).
- The version and platform you tested on.

We will acknowledge reports within **72 hours** and aim to provide a fix or
mitigation within **30 days**. Coordinated disclosure is appreciated.

## Scope

This policy covers the LocalPDF Studio application source in this repository.
Out of scope:
- Vulnerabilities in third-party external engines (qpdf, LibreOffice, Tesseract,
  Ghostscript) — report those to their upstream projects.
- Issues that require already-existing local code execution or root access.

## Supported Versions

Only the latest release line receives security updates.

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |
| < 1.0   | ❌        |
