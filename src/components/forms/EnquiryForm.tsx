'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { useStore } from '@/components/providers/StoreProviders';

interface EnquiryFormProps {
  type: 'bulk_wholesale' | 'contact_support' | 'privacy_request';
  title: string;
  submitLabel: string;
}

export function EnquiryForm({ type, title, submitLabel }: EnquiryFormProps) {
  const { trackEvent } = useStore();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cityState, setCityState] = useState('');
  const [interestedProducts, setInterestedProducts] = useState('');
  const [estimatedMonthlyKg, setEstimatedMonthlyKg] = useState('');
  const [message, setMessage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name,
          businessName,
          phone,
          email,
          cityState,
          interestedProducts,
          estimatedMonthlyKg,
          message,
          websiteUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Please fix the highlighted fields.');
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitting(false);
        return;
      }

      setReferenceCode(data.referenceCode);
      if (type === 'bulk_wholesale') {
        trackEvent({ eventName: 'bulk_enquiry_submit' });
      }
    } catch {
      setError('Network error while submitting your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (referenceCode) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] p-6 text-[var(--brand-leaf)]"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl font-bold">Enquiry Recorded Safely</h2>
            <p className="mt-1 text-sm">
              Reference ID: <strong className="font-mono-num">{referenceCode}</strong>. Our Madurai
              team will respond using your contact details.
            </p>
            <a
              href={buildWhatsAppUrl(
                `Hello ${BRAND.fullName}, I just submitted enquiry ${referenceCode} (${type.replace(/_/g, ' ')}) on your website.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[var(--brand-leaf)] px-4 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Follow Up on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:p-6"
    >
      <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">{title}</h2>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Anti-bot honeypot hidden from humans & screen readers */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`hp-${type}`}>Leave empty</label>
        <input
          id={`hp-${type}`}
          tabIndex={-1}
          autoComplete="off"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`enq-name-${type}`} className="block text-xs font-semibold text-[var(--text-primary)]">
            Your Name <span className="text-[var(--brand-crimson)]">*</span>
          </label>
          <input
            id={`enq-name-${type}`}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
          />
          {fieldErrors.name?.[0] && <p className="mt-1 text-xs text-red-700">{fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor={`enq-phone-${type}`} className="block text-xs font-semibold text-[var(--text-primary)]">
            Indian Mobile Number <span className="text-[var(--brand-crimson)]">*</span>
          </label>
          <input
            id={`enq-phone-${type}`}
            type="tel"
            required
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
          />
          {fieldErrors.phone?.[0] && <p className="mt-1 text-xs text-red-700">{fieldErrors.phone[0]}</p>}
        </div>

        <div>
          <label htmlFor={`enq-email-${type}`} className="block text-xs font-semibold text-[var(--text-primary)]">
            Email (Optional)
          </label>
          <input
            id={`enq-email-${type}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
          />
          {fieldErrors.email?.[0] && <p className="mt-1 text-xs text-red-700">{fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor={`enq-city-${type}`} className="block text-xs font-semibold text-[var(--text-primary)]">
            City & State
          </label>
          <input
            id={`enq-city-${type}`}
            placeholder="e.g. Madurai, Tamil Nadu"
            value={cityState}
            onChange={(e) => setCityState(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
          />
        </div>

        {type === 'bulk_wholesale' && (
          <>
            <div>
              <label htmlFor="enq-biz" className="block text-xs font-semibold text-[var(--text-primary)]">
                Business / Store / Caterer Name
              </label>
              <input
                id="enq-biz"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="enq-vol" className="block text-xs font-semibold text-[var(--text-primary)]">
                Estimated Quantity / Monthly Volume
              </label>
              <input
                id="enq-vol"
                placeholder="e.g. 25 kg / month or 100 gift packs"
                value={estimatedMonthlyKg}
                onChange={(e) => setEstimatedMonthlyKg(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="enq-skus" className="block text-xs font-semibold text-[var(--text-primary)]">
                Products of Interest
              </label>
              <input
                id="enq-skus"
                placeholder="e.g. Sambar Podi, Bhai Veetu Kari Masala, Idli Milagai Podi, Ulundhu Kali"
                value={interestedProducts}
                onChange={(e) => setInterestedProducts(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={`enq-msg-${type}`} className="block text-xs font-semibold text-[var(--text-primary)]">
            Details / Message <span className="text-[var(--brand-crimson)]">*</span>
          </label>
          <textarea
            id={`enq-msg-${type}`}
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'privacy_request'
                ? 'Specify whether you request data access, correction, consent withdrawal, or deletion.'
                : 'Tell us how we can help...'
            }
            className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-3.5 text-sm"
          />
          {fieldErrors.message?.[0] && <p className="mt-1 text-xs text-red-700">{fieldErrors.message[0]}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--brand-crimson)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
}
