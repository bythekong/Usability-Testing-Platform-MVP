'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, CheckSquare, Eye, MessageSquare, Monitor, MousePointerClick, PlusCircle } from 'lucide-react';
import { ImagePlaceholder } from './ImagePlaceholder';

const steps = [
  { id: '01', role: 'OWNER', title: 'Create campaign', description: 'Set the target URL and the tasks you want people to complete.', icon: PlusCircle },
  { id: '02', role: 'TESTER', title: 'Claim a job', description: 'A tester picks an available study from the tester dashboard.', icon: MousePointerClick },
  { id: '03', role: 'TESTER', title: 'Open the real site', description: 'The extension activates only when the claimed target matches.', icon: Monitor },
  { id: '04', role: 'TESTER', title: 'Complete tasks', description: 'The tester follows task prompts while using the real product.', icon: CheckSquare },
  { id: '05', role: 'TESTER', title: 'Submit feedback', description: 'Task responses are sent back once every task is complete.', icon: MessageSquare },
  { id: '06', role: 'OWNER', title: 'Review the session', description: 'The owner reads the task-by-task feedback in context.', icon: Eye },
  { id: '07', role: 'OWNER', title: 'Approve or reject', description: 'The owner closes the loop with a one-way review decision.', icon: CheckCircle },
];

export function WorkflowStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 75%', 'end 25%'] });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-1.5, 0, 1.5]);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative border-y border-border bg-surface py-28 md:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p><h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">One study. Two roles. One continuous testing loop.</h2></div>
          <p className="max-w-xl text-lg leading-8 text-muted lg:justify-self-end">The product moves between owner, tester, browser, and review. The page now visualizes that flow instead of stacking generic feature cards.</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div style={reduceMotion ? undefined : { y: imageY, rotate: imageRotate }}>
              <ImagePlaceholder title="Workflow photography — researcher observing a real product test" description="Wide editorial photo showing a participant using a laptop while a researcher observes from the side. Leave negative space for floating campaign / task UI overlays." aspectRatio="16 / 10" dimensions="1600 × 1000" filePath="apps/web/public/home_image/workflow_observation_001.webp" className="shadow-[0_32px_90px_rgba(15,23,42,0.22)]" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative -mt-16 ml-4 max-w-sm rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur md:ml-8">
              <div className="flex items-center justify-between text-xs"><span className="font-semibold text-foreground">Checkout Flow Test</span><span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">IN PROGRESS</span></div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border"><motion.div className="h-full origin-left rounded-full bg-primary" style={reduceMotion ? { scaleX: 1 } : { scaleX: progressScale }} /></div>
              <div className="mt-3 flex justify-between text-[11px] text-muted"><span>Owner created</span><span>Review complete</span></div>
            </motion.div>
          </div>

          <div className="relative pl-9 md:pl-12">
            <div className="absolute bottom-0 left-[9px] top-0 w-px bg-border md:left-[13px]" />
            <motion.div aria-hidden="true" style={reduceMotion ? { scaleY: 1 } : { scaleY: progressScale }} className="absolute bottom-0 left-[9px] top-0 w-px origin-top bg-primary md:left-[13px]" />
            <div className="space-y-6 md:space-y-8">
              {steps.map((step, index) => (
                <motion.article key={step.id} initial={{ opacity: 0, x: 44, scale: 0.98 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: false, amount: 0.38 }} transition={{ duration: 0.6, delay: index % 2 === 0 ? 0 : 0.03, ease: [0.22, 1, 0.36, 1] }} className="relative rounded-[1.6rem] border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-lg md:p-6">
                  <div className="absolute -left-[42px] top-7 flex h-7 w-7 items-center justify-center rounded-full border-4 border-surface bg-background text-primary shadow-sm md:-left-[50px] md:h-8 md:w-8"><step.icon className="h-3.5 w-3.5 md:h-4 md:w-4" /></div>
                  <div className="flex items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"><span className={step.role === 'OWNER' ? 'text-primary' : 'text-orange-500'}>{step.role}</span><span className="text-muted/60">{step.id}</span></div><h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">{step.title}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted md:text-base">{step.description}</p></div></div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
