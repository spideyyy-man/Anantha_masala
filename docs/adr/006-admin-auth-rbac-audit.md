# ADR-006: Admin Authentication, RBAC, MFA & Immutable Audit Trail
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
Operators need a minimal, secure admin console to manage product stock/pricing, inspect & update orders, review wholesale/contact enquiries, and monitor aggregate conversion metrics, without exposing customer data or creating OWASP ASVS broken-access-control risks.

## Decision
- **Password Hashing:** Node.js `crypto.scryptSync` with 16-byte cryptographic random salt (`N=16384, r=8, p=1`) and `crypto.timingSafeEqual` verification.
- **Two-Step MFA:** Mandatory second-factor 6-digit verification challenge (TOTP-compatible flow; development/sandbox MFA challenge verified server-side, ready for authenticator secret binding in production).
- **Sessions:** Opaque 32-byte cryptographically random session tokens stored hashed (SHA-256) in PostgreSQL `admin_sessions` with `HttpOnly`, `SameSite=Lax`, `Secure` (production), explicit expiry, and session rotation on login/MFA completion.
- **RBAC:** `super_admin`, `catalog_manager`, `order_operator` enforced in server domain guards.
- **Audit Trail:** Every login, price/stock mutation, and order status change writes an immutable row to `audit_events` (actor, role, action, target, before/after summary, UTC timestamp).
- **Customer Checkout:** Guest-first checkout; order lookup requires BOTH `orderNumber` AND matching customer `phone` (preventing IDOR/BOLA enumeration).

## Reversal Trigger
Adopt external SSO / Passkeys (WebAuthn) if admin staff exceeds 5 operators or enterprise compliance requires centralized IAM.
