'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@zmd/shared';
import { apiGet } from './api';

export function CategoryList() {
  const [rows, setRows] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Category[]>('/categories')
      .then(setRows)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div className="text-sm text-red-400">{err}</div>;
  if (!rows.length) return <div className="text-sm text-zinc-500">No categories yet.</div>;

  return (
    <ul className="space-y-2">
      {rows.map((c) => (
        <li key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-2">
          <div className="text-sm">{c.name}</div>
          <div className="text-xs text-zinc-500">
            {c.requiresVerification ? 'verification' : 'open'}
          </div>
        </li>
      ))}
    </ul>
  );
}
