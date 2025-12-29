'use client';

import { useEffect, useMemo, useState } from 'react';
import type { JobRequest, Offer } from '@zmd/shared';
import { CreateOfferInputSchema } from '@zmd/shared';
import { apiGet, apiPost } from './api';

const demoProviderHeaders = { 'x-user-id': 'demo_provider_1', 'x-role': 'provider' };
const demoCustomerHeaders = { 'x-user-id': 'demo_customer_1', 'x-role': 'customer' };

export function RequestDetail({ id }: { id: string }) {
  const [reqRow, setReqRow] = useState<JobRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [status, setStatus] = useState<string>('');
  const [offerForm, setOfferForm] = useState({ message: 'I can do this.', price: '' });

  async function reload() {
    setStatus('');
    try {
      const rows = await apiGet<JobRequest[]>('/job-requests');
      setReqRow(rows.find((r) => r.id === id) ?? null);
      const offs = await apiGet<Offer[]>(`/job-requests/${id}/offers`);
      setOffers(offs);
    } catch (e: any) {
      setStatus(String(e));
    }
  }

  useEffect(() => {
    reload();
  }, [id]);

  async function sendOffer() {
    if (!reqRow) return;
    setStatus('');
    const payload = {
      jobRequestId: id,
      message: offerForm.message,
      proposedPrice: offerForm.price ? Number(offerForm.price) : undefined,
    };
    const parsed = CreateOfferInputSchema.safeParse(payload);
    if (!parsed.success) {
      setStatus(parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }
    try {
      await apiPost('/offers', parsed.data, demoProviderHeaders);
      setOfferForm({ message: 'I can do this.', price: '' });
      await reload();
    } catch (e: any) {
      setStatus(String(e));
    }
  }

  async function acceptOffer(offerId: string) {
    setStatus('');
    try {
      await apiPost(`/offers/${offerId}/accept`, {}, demoCustomerHeaders);
      await reload();
      setStatus('Offer accepted → booking created.');
    } catch (e: any) {
      setStatus(String(e));
    }
  }

  if (!reqRow) return <div className="text-sm text-zinc-400">Request not found.</div>;

  return (
    <div className="space-y-4">
      {status ? <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-xs">{status}</div> : null}

      <div>
        <div className="text-lg font-semibold">{reqRow.title}</div>
        <div className="mt-1 text-sm text-zinc-400">{reqRow.description}</div>
        <div className="mt-2 text-xs text-zinc-500">
          Status: {reqRow.status} · {reqRow.pricingMode} · {reqRow.locationText}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 p-3">
        <div className="mb-2 text-sm font-semibold">Provider: send an offer (demo)</div>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            className="md:col-span-2 rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={offerForm.message}
            onChange={(e) => setOfferForm((f) => ({ ...f, message: e.target.value }))}
          />
          <input
            className="rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            placeholder="Price (optional)"
            value={offerForm.price}
            onChange={(e) => setOfferForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
        <button
          className="mt-2 rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
          onClick={sendOffer}
        >
          Send offer
        </button>
      </div>

      <div className="rounded-lg border border-zinc-800 p-3">
        <div className="mb-2 text-sm font-semibold">Offers</div>
        {offers.length === 0 ? (
          <div className="text-sm text-zinc-500">No offers yet.</div>
        ) : (
          <ul className="space-y-2">
            {offers.map((o) => (
              <li key={o.id} className="rounded-md border border-zinc-800 p-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm">{o.message || '(no message)'}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Provider: {o.providerId} · Status: {o.status} · Price: {o.proposedPrice ?? '—'}
                    </div>
                  </div>
                  <button
                    disabled={o.status !== 'SENT' || reqRow.status !== 'OPEN'}
                    onClick={() => acceptOffer(o.id)}
                    className="rounded-md border border-zinc-700 px-2 py-1 text-xs enabled:hover:bg-zinc-900 disabled:opacity-40"
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a className="text-xs text-zinc-400 underline" href="/">
        ← Back
      </a>
    </div>
  );
}
