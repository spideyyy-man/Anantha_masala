import { computeHmacSha256Hex, generateSecureToken, verifyHmacSha256Hex } from '@/lib/security/crypto';

export interface ProviderOrderInput {
  orderNumber: string;
  amountPaise: number;
  currency: 'INR';
  customerName: string;
  customerPhone: string;
}

export interface ProviderOrderResult {
  provider: 'razorpay' | 'sandbox';
  mode: 'live' | 'sandbox';
  providerOrderId: string;
  publicKeyId: string | null;
  amountPaise: number;
  currency: 'INR';
}

export interface ParsedWebhookEvent {
  eventId: string;
  eventType: 'payment.captured' | 'payment.pending' | 'payment.failed';
  providerOrderId: string;
  providerPaymentId: string;
  orderNumber?: string;
  failureReason?: string;
}

export interface PaymentProviderAdapter {
  readonly providerName: 'razorpay' | 'sandbox';
  readonly isSandbox: boolean;
  createPaymentOrder(input: ProviderOrderInput): Promise<ProviderOrderResult>;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
  parseWebhookPayload(rawBody: string): ParsedWebhookEvent;
}

export function getSandboxWebhookSecret(): string {
  return process.env.SANDBOX_WEBHOOK_SECRET || 'dev-local-sandbox-webhook-secret-change-in-prod';
}

class SandboxPaymentAdapter implements PaymentProviderAdapter {
  readonly providerName = 'sandbox' as const;
  readonly isSandbox = true;

  async createPaymentOrder(input: ProviderOrderInput): Promise<ProviderOrderResult> {
    return {
      provider: 'sandbox',
      mode: 'sandbox',
      providerOrderId: `sbx_ord_${input.orderNumber}_${generateSecureToken(6)}`,
      publicKeyId: null,
      amountPaise: input.amountPaise,
      currency: input.currency,
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    return verifyHmacSha256Hex(rawBody, signatureHeader, getSandboxWebhookSecret());
  }

  parseWebhookPayload(rawBody: string): ParsedWebhookEvent {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    const eventType = parsed.eventType as ParsedWebhookEvent['eventType'];
    if (!['payment.captured', 'payment.pending', 'payment.failed'].includes(eventType)) {
      throw new Error('Unsupported sandbox webhook eventType');
    }
    return {
      eventId: String(parsed.eventId || ''),
      eventType,
      providerOrderId: String(parsed.providerOrderId || ''),
      providerPaymentId: String(parsed.providerPaymentId || ''),
      orderNumber: parsed.orderNumber ? String(parsed.orderNumber) : undefined,
      failureReason: parsed.failureReason ? String(parsed.failureReason) : undefined,
    };
  }
}

class RazorpayPaymentAdapter implements PaymentProviderAdapter {
  readonly providerName = 'razorpay' as const;
  readonly isSandbox = false;

  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(keyId: string, keySecret: string, webhookSecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.webhookSecret = webhookSecret;
  }

  async createPaymentOrder(input: ProviderOrderInput): Promise<ProviderOrderResult> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.orderNumber,
        notes: {
          orderNumber: input.orderNumber,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Payment gateway order creation failed (${res.status})`);
    }

    const data = (await res.json()) as { id: string; amount: number };
    return {
      provider: 'razorpay',
      mode: 'live',
      providerOrderId: data.id,
      publicKeyId: this.keyId,
      amountPaise: data.amount,
      currency: input.currency,
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    return verifyHmacSha256Hex(rawBody, signatureHeader, this.webhookSecret);
  }

  parseWebhookPayload(rawBody: string): ParsedWebhookEvent {
    const parsed = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            error_description?: string;
          };
        };
      };
    };

    const payment = parsed.payload?.payment?.entity;
    const event = parsed.event || '';
    const mappedType: ParsedWebhookEvent['eventType'] =
      event === 'payment.captured'
        ? 'payment.captured'
        : event === 'payment.failed'
          ? 'payment.failed'
          : 'payment.pending';

    return {
      eventId: `${event}_${payment?.id || 'unknown'}`,
      eventType: mappedType,
      providerOrderId: payment?.order_id || '',
      providerPaymentId: payment?.id || '',
      failureReason: payment?.error_description,
    };
  }
}

export function getPaymentProviderAdapter(): PaymentProviderAdapter {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (keyId && keySecret && webhookSecret) {
    return new RazorpayPaymentAdapter(keyId, keySecret, webhookSecret);
  }
  return new SandboxPaymentAdapter();
}

export function signSandboxWebhookBody(rawBody: string): string {
  return computeHmacSha256Hex(rawBody, getSandboxWebhookSecret());
}
