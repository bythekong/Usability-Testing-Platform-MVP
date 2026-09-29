'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownRight, CheckCircle2, MousePointerClick, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImagePlaceholder } from './ImagePlaceholder';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden px-6 pb-24 pt-28 md:pb-32 md:pt-36">
      <motion.div aria-hidden="true" style={reduceMotion ? undefined : { scale: glowScale }} className="absolute -right-44 -top-44 -z-20 h-[38rem] w-[38rem] rounded-full bg-primary/12 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.12),transparent_30%)]" />

      <div className="container mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/75 px-3 py-1.5 text-xs font-semibold text-muted shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-success-text" /> Usability testing on the real product
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} className="text-balance text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[5.4rem]">
            See where users <span className="text-primary">hesitate.</span><br />Before you ship.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }} className="mt-7 max-w-xl text-lg leading-8 text-muted md:text-xl">
            Create task-based studies, let real testers use your live website, and review contextual feedback without building a custom research stack.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login"><Button size="lg" className="h-14 w-full rounded-full px-7 text-base shadow-lg shadow-primary/20 sm:w-auto">Start a test <ArrowDownRight className="ml-2 h-4 w-4" /></Button></Link>
            <a href="#how-it-works"><Button variant="secondary" size="lg" className="h-14 w-full rounded-full px-7 text-base sm:w-auto">Watch the workflow</Button></a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Real target URL</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Chrome Extension flow</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Owner review</span>
          </motion.div>
        </div>

        <div className="relative min-h-[580px] md:min-h-[700px] lg:min-h-[760px]">
          <motion.div style={reduceMotion ? undefined : { y: imageY }} initial={{ opacity: 0, scale: 0.96, rotate: 1.5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-0 top-4 mx-auto w-[88%] md:w-[78%] lg:w-[82%]">
            <ImagePlaceholder title="Hero photography — moderated-looking remote usability session" description="Candid photo of a tester using a laptop on a real website while an observer takes notes nearby. Natural light, human, premium, documentary rather than stock-photo corporate." aspectRatio="4 / 5" dimensions="1200 × 1500" filePath="apps/web/public/home_image/hero_test_session_001.webp" className="shadow-[0_40px_110px_rgba(15,23,42,0.28)]" />
          </motion.div>

          <motion.div style={reduceMotion ? undefined : { y: cardY }} initial={{ opacity: 0, x: -40, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.75, delay: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute left-0 top-[18%] w-[76%] max-w-sm rounded-2xl border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur md:left-[2%]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Live campaign</p><h3 className="mt-1 font-semibold text-foreground">Checkout Flow Test</h3><p className="mt-1 text-xs text-muted">example.com · 3 tasks</p></div><span className="rounded-full bg-success-bg px-2 py-1 text-[10px] font-bold text-success-text">ACTIVE</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-background p-3"><Users className="h-4 w-4 text-primary" /><p className="mt-2 text-xs text-muted">Tester claimed</p></div><div className="rounded-xl bg-background p-3"><MousePointerClick className="h-4 w-4 text-primary" /><p className="mt-2 text-xs text-muted">Task 2 / 3</p></div></div>
          </motion.div>

          <motion.div style={reduceMotion ? undefined : { y: imageY }} initial={{ opacity: 0, x: 44, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.75, delay: 0.58, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-[3%] right-0 w-[82%] max-w-md rounded-2xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur md:right-[2%]">
            <div className="flex items-center gap-2 border-b border-border px-2 pb-2 text-[10px] text-muted"><span className="h-2 w-2 rounded-full bg-danger" /><span className="h-2 w-2 rounded-full bg-warning-text" /><span className="h-2 w-2 rounded-full bg-success-text" /><span className="ml-2 rounded bg-surface px-2 py-1">example.com/pricing</span></div>
            <div className="grid grid-cols-[1fr_0.82fr] gap-3 p-2 pt-4"><div className="space-y-3 opacity-60"><div className="h-4 w-2/3 rounded bg-border" /><div className="h-20 rounded-xl bg-surface" /><div className="h-10 rounded-xl bg-surface" /></div><div className="rounded-xl bg-primary p-4 text-white"><p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">Task 2 of 3</p><p className="mt-2 text-xs font-medium">Find the plan you would choose for a small team.</p><div className="mt-4 h-7 rounded-md bg-white text-center text-[10px] font-semibold leading-7 text-primary">Complete task</div></div></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
