'use client';

import { useEffect, useState } from 'react';
import type { JobRequest } from '@zmd/shared';
import { apiGet } from './api';

export function JobRequestList() {
  const [rows, setRows] = useState<JobRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<JobRequest[]>('/job-requests?status=OPEN')
      .then(setRows)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div className="text-sm text-red-400">{err}</div>;
  if (!rows.length) return <div className="text-sm text-zinc-500">No open requests yet.</div>;

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="rounded-lg border border-zinc-800 p-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{r.title}</div>
              <div className="mt-1 text-xs text-zinc-400 line-clamp-2">{r.description}</div>
            </div>
            <a
              className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-900"
              href={`/requests/${r.id}`}
            >
              View
            </a>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {r.pricingMode} · {r.locationText}
          </div>
        </li>
      ))}
    </ul>
  );
}
