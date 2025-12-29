export default function Docs() {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
  return (
    <main className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h1 className="text-lg font-semibold">API docs</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Swagger UI is served by the API at <code className="text-zinc-200">{base}/docs</code>.
      </p>
      <a
        className="mt-4 inline-block rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
        href={`${base}/docs`}
        target="_blank"
        rel="noreferrer"
      >
        Open Swagger UI
      </a>
    </main>
  );
}
