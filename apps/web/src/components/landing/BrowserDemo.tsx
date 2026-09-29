'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check, Chrome, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImagePlaceholder } from './ImagePlaceholder';

export function BrowserDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 0.5, 1], [70, 0, -70]);
  const panelY = useTransform(scrollYProgress, [0, 0.5, 1], [120, 0, -110]);
  const cursorX = useTransform(scrollYProgress, [0.15, 0.48, 0.72], ['25%', '68%', '62%']);
  const cursorY = useTransform(scrollYProgress, [0.15, 0.48, 0.72], ['65%', '38%', '58%']);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background py-28 md:py-40">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_60%)]" />
      <div className="container relative mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted"><Chrome className="h-4 w-4 text-primary" /> Chrome Extension experience</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ delay: 0.05 }} className="mt-5 text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">Keep the task beside the product.</motion.h2>
          <motion.p initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ delay: 0.1 }} className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">The tester works on the real target site while the extension keeps progress, instructions, and feedback in context.</motion.p>
        </div>

        <motion.div style={reduceMotion ? undefined : { y: frameY }} className="relative mx-auto max-w-6xl rounded-[2rem] border border-border bg-surface p-2 shadow-[0_48px_120px_rgba(15,23,42,0.25)] md:p-3">
          <div className="overflow-hidden rounded-[1.55rem] border border-border bg-background">
            <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" /><span className="h-2.5 w-2.5 rounded-full bg-warning-text" /><span className="h-2.5 w-2.5 rounded-full bg-success-text" /></div>
              <div className="mx-auto flex h-8 w-[68%] items-center rounded-lg border border-border bg-background px-3 text-[11px] text-muted">https://acme-corp.com/pricing</div>
            </div>

            <div className="relative min-h-[520px] p-4 md:min-h-[680px] md:p-8">
              <ImagePlaceholder title="Browser content image — target website being tested" description="A realistic SaaS pricing / checkout webpage screenshot or staged product visual. This becomes the real website underneath the extension panel, not a decorative illustration." aspectRatio="16 / 9" dimensions="1600 × 900" filePath="apps/web/public/home_image/target_website_pricing_001.webp" priorityLabel="FPO PRODUCT IMAGE" className="h-full min-h-[490px] w-full md:min-h-[620px]" />

              <motion.div style={reduceMotion ? undefined : { x: cursorX, y: cursorY }} className="pointer-events-none absolute left-2 top-2 hidden h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-background/80 text-primary shadow-lg backdrop-blur md:flex"><MousePointer2 className="h-5 w-5" /></motion.div>

              <motion.aside style={reduceMotion ? undefined : { y: panelY }} initial={{ opacity: 0, x: 70 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-7 right-6 w-[calc(100%-3rem)] max-w-sm overflow-hidden rounded-2xl border border-border bg-background/96 shadow-2xl backdrop-blur md:bottom-auto md:right-10 md:top-16 md:w-80">
                <div className="flex items-center justify-between bg-primary px-4 py-3 text-white"><span className="text-sm font-semibold">Testing Platform</span><span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold">2 / 3</span></div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Current task</p>
                  <h3 className="mt-2 font-semibold text-foreground">Find the Pro plan</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">Navigate the pricing page and choose the plan that best fits a small team.</p>
                  <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Your feedback</label>
                  <div className="mt-2 min-h-20 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted">The pricing options are easy to scan, but I expected support details to be closer to the plan name.</div>
                  <Button className="mt-4 w-full"><Check className="mr-2 h-4 w-4" /> Complete task</Button>
                </div>
              </motion.aside>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-3 md:grid-cols-3">
          {[
            ['01', 'Claimed URL', 'Extension knows which site belongs to the active job.'],
            ['02', 'Contextual tasks', 'Instructions remain visible while the tester navigates.'],
            ['03', 'Explicit submit', 'The completed task sequence is returned to the owner.'],
          ].map(([number, title, body], index) => (
            <motion.div key={number} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.55 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-border bg-surface p-5"><span className="text-xs font-bold text-primary">{number}</span><h3 className="mt-3 font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{body}</p></motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
