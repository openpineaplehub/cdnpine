# 🔐 Security Policy

## 📅 Supported Versions

We actively maintain the following versions of this project. Please make sure you're using the latest stable release when reporting security issues.

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Supported        |
| Legacy  | ⚠️ Security Fixes Only |

## 🛠️ Reporting a Vulnerability

If you discover a security vulnerability in this project (e.g., CDN misconfiguration, data exposure, directory traversal, etc.), **please report it responsibly**.

- **Do not open a public GitHub issue.**
- Instead, contact us privately at:  
  📧 `security@[yourdomain].com`  
  _(or replace with GitHub private discussion or contact form)_

We take security issues seriously and will respond as quickly as possible.

### What to include in your report:
- Description of the issue
- Steps to reproduce
- Potential impact
- Suggested mitigation (optional)

We aim to acknowledge reports within **72 hours** and, if valid, provide a fix or workaround as soon as possible.

## 🔏 Security Best Practices for Users

To keep your deployment safe, please follow these recommendations:

- Keep your server and CDN dependencies up to date.
- Use HTTPS for all CDN endpoints.
- Set proper CORS, Cache-Control, and security headers.
- Run behind a secure reverse proxy or firewall (e.g., Nginx, Cloudflare).
- Do not expose internal admin routes to the public.
- Regularly audit logs and usage.

## 🧪 Scope of Responsibility

This project is a **personal CDN server**, and we are not responsible for:
- Misconfigurations in your environment
- Data leakage caused by improper usage
- Security of third-party content you serve

Always test and secure your environment accordingly.

---

Thank you for helping us keep this project safe!
