'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/60 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs">
            U
          </div>
          <span className="font-semibold text-foreground text-sm">Usability Platform</span>
        </div>
        
        <div className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Usability Testing Platform MVP. All rights reserved.
        </div>
        
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/login" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
