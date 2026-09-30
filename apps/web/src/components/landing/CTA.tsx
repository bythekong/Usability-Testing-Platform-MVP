'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { TypeLine } from './TypeLine';

export function CTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="decision" className="landing-scene landing-grain relative overflow-hidden bg-[var(--lab-graphite)] px-6 py-28 text-[var(--lab-bone)] md:py-40">
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-80 w-[640px] -translate-x-1/2 rounded-full bg-[rgba(201,161,95,.06)] blur-3xl" />
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto max-w-5xl text-center">
        <h2 className="font-display text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
          <TypeLine duration={0.78} fromX={-14} fromY={18}>See what</TypeLine>
          <TypeLine delay={0.1} duration={0.86} fromX={14} fromY={18}>your users see.</TypeLine>
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/56 md:text-lg md:leading-8">Find the right participants, observe real behavior, and build evidence your team can reason about.</p>
        <div className="mx-auto mt-10 flex max-w-lg flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login?role=OWNER" className="landing-action group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--lab-bone)] px-6 text-sm font-semibold text-[var(--lab-graphite)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Create a study <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          <Link href="/login?role=TESTER" className="landing-action group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/22 px-6 text-sm font-semibold text-[var(--lab-bone)] hover:border-white/45 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Explore as a tester <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></Link>
        </div>
        <div className="mx-auto mt-16 h-px max-w-xl bg-white/10" />
        <p className="font-research mt-6 text-[9px] uppercase tracking-[0.15em] text-white/36">AI assists. Humans experience. Researchers decide.</p>
      </motion.div>
    </section>
  );
}
