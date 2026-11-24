# ADR-004: Payment Provider Abstraction & Signed Webhook Verification
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
Online Indian food commerce requires UPI, cards, netbanking, and wallets through a PCI-DSS compliant Indian gateway without ever handling raw card details on our server, while remaining unblocked in environments without live merchant keys.

## Options Considered
1. **Direct Razorpay SDK coupling in checkout routes**
2. **WhatsApp-only checkout** (blocks self-serve conversions)
3. **Provider-agnostic `PaymentProviderAdapter` with Razorpay production adapter + HMAC-signed Sandbox mode (Selected)**

## Decision
Implement `src/domain/payments/adapter.ts` defining `createPaymentOrder`, `verifyClientSignature`, `verifyWebhookSignature`, and `parseWebhookEvent`.
- **Production adapter (`RazorpayAdapter`):** Activates automatically when `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are set. Uses hosted checkout tokenization + HMAC-SHA256 webhook verification.
- **Sandbox adapter (`SandboxPaymentAdapter`):** Activates when live credentials are absent, prominently badged as **TEST SANDBOX MODE — NO REAL CHARGE**, allowing full verification of `captured`, `pending`, and `failed` payment flows via real cryptographically signed HMAC-SHA256 webhooks (`/api/webhooks/payments`) with `payment_webhook_events` replay/idempotency deduplication.
- Never trust client redirect success alone; final order payment state updates strictly via server-verified webhook / gateway signature check.

## Consequences
- Zero raw cardholder data touches our infrastructure (PCI scope minimized).
- Idempotency keys prevent duplicate orders/charges on double-clicks or webhook retries.

## Reversal Trigger
Add Cashfree or PayU adapter alongside Razorpay if settlement fees, UPI success rates, or onboarding timelines favor a secondary provider.
