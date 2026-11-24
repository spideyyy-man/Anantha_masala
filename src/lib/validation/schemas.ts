import { z } from 'zod';

const indianPhoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const indianPincodeRegex = /^[1-9]\d{5}$/;

export const cartMutateSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(0).max(25),
});

export const cartAddSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(25).default(1),
});

export const guestCheckoutSchema = z.object({
  idempotencyKey: z.string().trim().min(12).max(128),
  customerName: z.string().trim().min(2, 'Please enter your full name').max(100),
  customerPhone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  customerEmail: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .max(120)
    .optional()
    .or(z.literal('')),
  shippingAddressLine1: z.string().trim().min(5, 'Enter street/door address').max(200),
  shippingAddressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  shippingCity: z.string().trim().min(2, 'Enter city or town').max(80),
  shippingState: z.string().trim().min(2, 'Select state').max(80),
  shippingPincode: z
    .string()
    .trim()
    .regex(indianPincodeRegex, 'Enter a valid 6-digit Indian pincode'),
  deliveryNotes: z.string().trim().max(240).optional().or(z.literal('')),
  utmSource: z.string().trim().max(80).optional(),
  utmMedium: z.string().trim().max(80).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
});

export const orderTrackSchema = z.object({
  orderNumber: z.string().trim().min(6).max(40),
  phone: z.string().trim().regex(indianPhoneRegex, 'Enter the 10-digit mobile number used at checkout'),
});

export const enquirySchema = z.object({
  type: z.enum(['bulk_wholesale', 'contact_support', 'privacy_request']),
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  businessName: z.string().trim().max(140).optional().or(z.literal('')),
  phone: z.string().trim().regex(indianPhoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email('Enter a valid email address').max(120).optional().or(z.literal('')),
  cityState: z.string().trim().max(120).optional().or(z.literal('')),
  interestedProducts: z.string().trim().max(400).optional().or(z.literal('')),
  estimatedMonthlyKg: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().min(8, 'Please share a few details so we can help').max(1500),
  /** Honeypot anti-bot field — must remain empty */
  websiteUrl: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

export const consentSchema = z.object({
  anonymousId: z.string().trim().min(8).max(80),
  analyticsAccepted: z.boolean(),
  marketingAccepted: z.boolean().default(false),
});

/** Strict allowlist schema for privacy-first analytics (no PII fields permitted). */
export const analyticsEventSchema = z
  .object({
    anonymousId: z.string().trim().min(8).max(80),
    eventName: z.enum([
      'page_view',
      'campaign_landing',
      'category_view',
      'search',
      'filter_apply',
      'product_view',
      'variant_select',
      'add_to_cart',
      'remove_from_cart',
      'begin_checkout',
      'shipping_selected',
      'payment_attempt',
      'purchase',
      'whatsapp_click',
      'bulk_enquiry_submit',
      'recipe_view',
      'social_video_click',
    ]),
    path: z.string().trim().min(1).max(200),
    deviceClass: z.enum(['mobile', 'tablet', 'desktop', 'unknown']).default('unknown'),
    utmSource: z.string().trim().max(80).optional(),
    utmMedium: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(120).optional(),
    productSlug: z.string().trim().max(100).optional(),
    categorySlug: z.string().trim().max(100).optional(),
    searchQuery: z.string().trim().max(100).optional(),
    valuePaise: z.number().int().min(0).max(100_000_000).optional(),
  })
  .strict(); // Rejects any unexpected fields (like email, phone, name, address)!

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(128),
});

export const adminMfaVerifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

export const adminVariantUpdateSchema = z.object({
  variantId: z.number().int().positive(),
  pricePaise: z.number().int().min(100).max(5_000_000).nullable(),
  stockQty: z.number().int().min(0).max(100000),
  isOrderableOnline: z.boolean(),
});

export const adminOrderStatusUpdateSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(['pending_payment', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']),
});

export const sandboxPaymentActionSchema = z.object({
  orderNumber: z.string().trim().min(6).max(40),
  outcome: z.enum(['captured', 'pending', 'failed']),
  eventId: z.string().trim().min(6).max(80).optional(),
});

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}
