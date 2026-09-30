'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 28;
    setScrolled((current) => (current === next ? current : next));
  });

  return (
    <motion.header initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? 'border-white/8 bg-[rgba(11,13,18,.82)] backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-5 px-6">
        <Link href="#lab" className="group flex items-center gap-3 text-[var(--lab-bone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/16 bg-white/[0.06] font-display text-sm font-semibold transition-[transform,border-color,background-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-white/28 group-hover:bg-white/[0.09]">U</span>
          <span className="hidden sm:block"><span className="block text-sm font-semibold tracking-[-0.015em]">Usability Platform</span><span className="font-research block text-[7px] uppercase tracking-[0.14em] text-white/38">Future Test Lab</span></span>
        </Link>
        <nav className="hidden items-center gap-6 font-research text-[9px] uppercase tracking-[0.12em] text-white/52 lg:flex">
          <a href="#research-flow" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">Research flow</a>
          <a href="#study" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">For researchers</a>
          <a href="#observation" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">For testers</a>
          <a href="#qualification" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">Principles</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="landing-nav-link hidden px-3 py-2 text-sm font-medium text-white/66 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none sm:inline-flex">Sign in</Link>
          <Link href="/login?role=OWNER" className="landing-action inline-flex h-10 items-center rounded-full bg-[var(--lab-bone)] px-4 text-xs font-semibold text-[var(--lab-graphite)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Create a study</Link>
        </div>
      </div>
    </motion.header>
  );
}
