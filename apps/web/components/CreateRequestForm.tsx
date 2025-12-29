'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@zmd/shared';
import { CreateJobRequestInputSchema } from '@zmd/shared';
import { apiGet, apiPost } from './api';

const demoCustomerHeaders = { 'x-user-id': 'demo_customer_1', 'x-role': 'customer' };

export function CreateRequestForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<string>('');
  const [form, setForm] = useState({
    categoryId: 'cat-cleaning',
    title: '',
    description: '',
    pricingMode: 'FIXED',
    budgetMin: '',
    budgetMax: '',
    locationText: 'Zagreb',
    lat: '45.8150',
    lng: '15.9819',
    timeWindowStart: new Date().toISOString(),
    timeWindowEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    apiGet<Category[]>('/categories').then(setCategories).catch((e) => setStatus(String(e)));
  }, []);

  async function submit() {
    setStatus('');
    const payload = {
      categoryId: form.categoryId,
      title: form.title,
      description: form.description,
      pricingMode: form.pricingMode as any,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      locationText: form.locationText,
      location: { lat: Number(form.lat), lng: Number(form.lng) },
      timeWindowStart: form.timeWindowStart,
      timeWindowEnd: form.timeWindowEnd,
    };

    const parsed = CreateJobRequestInputSchema.safeParse(payload);
    if (!parsed.success) {
      setStatus(parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }

    try {
      const res = await apiPost('/job-requests', parsed.data, demoCustomerHeaders);
      setStatus(`Created: ${res.id}`);
      setForm((f) => ({ ...f, title: '', description: '' }));
    } catch (e: any) {
      setStatus(String(e));
    }
  }

  return (
    <div className="space-y-3">
      {status ? <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-xs">{status}</div> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Category</div>
          <select
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Pricing mode</div>
          <select
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.pricingMode}
            onChange={(e) => setForm((f) => ({ ...f, pricingMode: e.target.value }))}
          >
            <option value="FIXED">FIXED</option>
            <option value="HOURLY">HOURLY</option>
            <option value="QUOTE">QUOTE</option>
          </select>
        </label>
      </div>

      <label className="text-sm block">
        <div className="mb-1 text-xs text-zinc-400">Title</div>
        <input
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g., Help moving a sofa"
        />
      </label>

      <label className="text-sm block">
        <div className="mb-1 text-xs text-zinc-400">Description</div>
        <textarea
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What needs to be done? Any tools needed? Access notes?"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Budget min</div>
          <input
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.budgetMin}
            onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
            placeholder="e.g., 20"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Budget max</div>
          <input
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.budgetMax}
            onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
            placeholder="e.g., 50"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm md:col-span-2">
          <div className="mb-1 text-xs text-zinc-400">Location text</div>
          <input
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.locationText}
            onChange={(e) => setForm((f) => ({ ...f, locationText: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Lat</div>
          <input
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-xs text-zinc-400">Lng</div>
          <input
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
          />
        </label>
      </div>

      <button
        className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900"
        onClick={submit}
      >
        Create request
      </button>
    </div>
  );
}
