# ADR-007: Privacy-First Analytics & DPDP Act 2023 / Rules 2025 Consent Architecture
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
Instagram Reels and YouTube campaigns require reliable UTM attribution and commerce funnel metrics (`page_view`, `product_view`, `add_to_cart`, `begin_checkout`, `purchase`, `whatsapp_click`, `bulk_enquiry_submit`) while honoring India's DPDP Act 2023 / Rules 2025 consent minimization principles.

## Decision
- **Consent Gate:** Explicit, non-pre-ticked consent banner separating Strictly Necessary (cart/checkout/security) from Optional Analytics & Campaign Attribution. Optional analytics events are blocked client-side AND server-side unless explicit analytics consent is granted and recorded in `consent_records`.
- **Zero PII in Analytics:** Strict Zod schema on `/api/analytics` explicitly rejects/strips PII keys (name, email, phone, address, payment info) and accepts only anonymous session UUID, UTM params, event type, product/category slug, device class, and numeric cart/order totals.
- **User Rights:** Dedicated Consent Preference Center and Data Access/Deletion Request form on `/legal/privacy`.

## Reversal Trigger
Integrate server-side Meta Conversions API or GA4 Measurement Protocol only after legal consent validation and explicit business opt-in.
