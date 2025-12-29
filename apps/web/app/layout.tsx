import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZOVI-ME-DOCU',
  description: 'Hire a person nearby for local tasks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="text-lg font-semibold tracking-wide">ZOVI-ME-DOCU</div>
            <nav className="flex gap-4 text-sm text-zinc-300">
              <a className="hover:text-white" href="/">Marketplace</a>
              <a className="hover:text-white" href="/requests/new">Create request</a>
              <a className="hover:text-white" href="/docs">API</a>
            </nav>
          </header>
          {children}
          <footer className="mt-10 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
            Skeleton build. Auth/payments/verification are placeholders.
          </footer>
        </div>
      </body>
    </html>
  );
}
