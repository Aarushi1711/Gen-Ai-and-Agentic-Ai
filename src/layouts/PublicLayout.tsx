import React from 'react';
import Navbar from '../components/shared/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-surface-200 dark:border-surface-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">© 2025 Aaroh AI. Every great project starts with the right guidance.</p>
          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="/about" className="hover:text-surface-700 dark:hover:text-surface-300 transition-colors">About</a>
            <a href="/contact" className="hover:text-surface-700 dark:hover:text-surface-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
