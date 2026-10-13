import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentDate — agents that date on your behalf',
  description: 'Each person is an agent. The agents date each other. See who fits who best.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0b12] text-[#f2f2f7] antialiased">
        <header className="border-b border-white/10">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Agent<span className="text-[#ff4d8d]">Date</span>
            </a>
            <div className="flex gap-5 text-sm text-white/70">
              <a href="/demo" className="hover:text-white">Demo</a>
              <a href="/rankings" className="hover:text-white">Rankings</a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-xs text-white/40">
          Every person is an agent. The agents date each other.
        </footer>
      </body>
    </html>
  );
}
