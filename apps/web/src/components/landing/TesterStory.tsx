'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Monitor, MousePointerClick } from 'lucide-react';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ScrollReveal } from './ScrollReveal';

export function TesterStory() {
  return (
    <section id="tester" className="relative overflow-hidden border-y border-border bg-surface py-28 md:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
          <ScrollReveal direction="left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">For testers</p>
            <h2 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">The testing interface follows the tester into the real website.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Claim a study, open the target, and keep the instructions beside the product instead of switching between tabs and losing context.</p>

            <div className="mt-8 space-y-3">
              {[
                ['01', 'Claim a study', 'Choose an available job from the tester dashboard.'],
                ['02', 'Open target', 'The claimed URL opens in the browser.'],
                ['03', 'Extension activates', 'Task guidance appears only on the matching website.'],
              ].map(([number, title, text], index) => (
                <motion.div key={number} initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.6 }} transition={{ delay: index * 0.06 }} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                  <span className="text-xs font-bold text-primary">{number}</span><div><p className="font-semibold text-foreground">{title}</p><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          <div className="relative">
            <ScrollReveal direction="right">
              <ImagePlaceholder
                title="Tester photography — real person completing a website task"
                description="Candid close-medium shot of a tester focused on a laptop while navigating a real website. Keep the laptop screen visible enough to support a composited extension overlay later."
                aspectRatio="4 / 3"
                dimensions="1400 × 1050"
                filePath="apps/web/public/home_image/tester_browser_session_001.webp"
                className="shadow-[0_36px_90px_rgba(15,23,42,0.24)]"
              />
            </ScrollReveal>

            <motion.div initial={{ opacity: 0, x: 38, y: 18 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative -mt-16 ml-auto w-[90%] max-w-md rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur md:-mt-24 md:mr-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" /><span className="font-semibold text-foreground">Available Jobs</span></div><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">TESTER</span></div>
              <div className="mt-4 rounded-xl border border-border bg-surface p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-foreground">Checkout Flow Test</p><p className="mt-1 text-xs text-muted">example.com · 3 tasks</p></div><button className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground">Claim <ArrowRight className="h-3 w-3" /></button></div></div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted"><MousePointerClick className="h-4 w-4 text-primary" /> The next step opens the target website.</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
