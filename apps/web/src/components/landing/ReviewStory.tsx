'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Quote, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EditorialImage } from './EditorialImage';
import { ScrollReveal } from './ScrollReveal';

export function ReviewStory() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-28 md:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <ScrollReveal direction="left">
              <EditorialImage
                src="/home_image/owner_review_feedback_001.webp"
                alt="A product researcher reviewing completed usability findings in a contemporary research studio."
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[3/2] shadow-[0_36px_90px_rgba(15,23,42,0.2)]"
                objectPosition="50% 50%"
              />
            </ScrollReveal>

            <motion.div initial={{ opacity: 0, y: 42, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.34 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="relative -mt-20 ml-auto w-[94%] max-w-xl overflow-hidden rounded-2xl border border-border bg-background/96 shadow-2xl backdrop-blur md:-mt-28 md:mr-5">
              <div className="flex items-start justify-between gap-4 border-b border-border p-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Owner review</p><h3 className="mt-1 font-semibold text-foreground">Tester Submission</h3><p className="mt-1 text-xs text-muted">tester_492 · Checkout Flow Test</p></div><span className="rounded-full bg-warning-bg px-2 py-1 text-[10px] font-bold text-warning-text">SUBMITTED</span></div>
              <div className="space-y-3 p-5">
                {[['Task 1', 'I found pricing quickly, but the plan differences needed a second read.'], ['Task 2', 'The checkout button was clear; loading feedback after click felt slow.']].map(([label, response]) => <div key={label} className="rounded-xl border border-border bg-surface p-4"><div className="flex items-center gap-2 text-xs font-semibold text-foreground"><Quote className="h-3.5 w-3.5 text-primary" /> {label}</div><p className="mt-2 text-xs leading-5 text-muted">{response}</p></div>)}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border bg-surface p-4"><Button variant="outline" size="sm"><XCircle className="mr-1.5 h-4 w-4" /> Reject</Button><Button size="sm"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve</Button></div>
            </motion.div>
          </div>

          <ScrollReveal direction="right" className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Close the loop</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">Feedback arrives where the owner can act on it.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Each submitted response stays attached to the campaign and task sequence, so review is direct and the decision state is explicit.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-5"><p className="text-sm font-semibold text-foreground">Task-by-task context</p><p className="mt-2 text-sm leading-6 text-muted">Read the feedback beside the task that produced it.</p></div>
              <div className="rounded-2xl border border-border bg-background p-5"><p className="text-sm font-semibold text-foreground">One-way review state</p><p className="mt-2 text-sm leading-6 text-muted">Approve or reject once, matching the existing job lifecycle.</p></div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
