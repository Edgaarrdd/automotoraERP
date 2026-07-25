# 🛡️ Policy & Public Repository Security Guidelines — CRM Automotora ERP

This repository is configured for public access. Follow these mandatory security practices when deploying to production environments or submitting code contributions.

---

## 🔒 1. Secrets & Environment Variables

- **NEVER** commit secret keys, database passwords, or private tokens to Git.
- Use environment variables (`.env`) for all sensitive credentials.
- In production, ensure `JWT_SECRET` is set to a cryptographically secure 256-bit key:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- Change all default seed passwords (`Admin123!`, `Gerente123!`, `Vendedor123!`) before deploying to a live tenant.

---

## 🛡️ 2. Multi-Tenant Data Isolation & RBAC

- All SQL queries and API endpoints must enforce `tenant_id` scoping to prevent cross-tenant data leaks.
- Endpoints modifying data (`POST`, `PATCH`, `DELETE`) use the `require_roles(...)` FastAPI dependency to enforce strict Role-Based Access Control.
- Password hashing is enforced using `bcrypt` with automatic salt generation and length truncation (max 72 bytes).

---

## 🚦 3. Pre-Deployment Security Checklist

- [ ] `JWT_SECRET` replaced with unique random secret.
- [ ] Debug mode disabled in production (`uvicorn app.main:app --host 0.0.0.0 --port 8000`).
- [ ] HTTPS / SSL Certificate enabled on load balancer or reverse proxy (Nginx / Caddy / Cloudflare).
- [ ] CORS origins explicitly configured in `.env` without wildcard `*`.
- [ ] Test suite verified cleanly via `pytest tests/test_api.py`.

---

## 📬 Vulnerability Reporting

If you discover a security vulnerability in this project, please send an email to `security@origen.cl` or open a confidential security advisory. Do not open public issues for zero-day vulnerabilities.
