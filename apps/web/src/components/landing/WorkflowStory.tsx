'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  FileCheck2,
  MessageSquareText,
  MonitorUp,
  MousePointerClick,
} from 'lucide-react';
import { ResearchLabel } from './ResearchLabel';

const steps = [
  {
    id: '01',
    role: 'OWNER',
    title: 'Create study',
    description: 'Target URL, participant context, and tasks become one study.',
    icon: ClipboardList,
    facts: ['TARGET / example.com', 'TASKS / 3 defined', 'STATE / READY'],
  },
  {
    id: '02',
    role: 'TESTER',
    title: 'Claim session',
    description: 'An eligible tester accepts an available research session.',
    icon: MousePointerClick,
    facts: ['SESSION / checkout-flow', 'ESTIMATE / 8–10 min', 'STATE / CLAIMED'],
  },
  {
    id: '03',
    role: 'BROWSER',
    title: 'Open live site',
    description: 'The claimed URL opens in the browser and context is verified.',
    icon: MonitorUp,
    facts: ['URL / matched', 'EXTENSION / ready', 'STATE / LIVE'],
  },
  {
    id: '04',
    role: 'EXTENSION',
    title: 'Complete tasks',
    description: 'Guidance stays beside the real product while the tester works.',
    icon: FileCheck2,
    facts: ['TASK / 02 of 03', 'THINK-ALOUD / active', 'TRACE / in context'],
  },
  {
    id: '05',
    role: 'TESTER',
    title: 'Submit responses',
    description: 'Completed responses return as one research submission.',
    icon: MessageSquareText,
    facts: ['RESPONSES / 3 of 3', 'SUBMISSION / complete', 'STATE / SUBMITTED'],
  },
  {
    id: '06',
    role: 'OWNER',
    title: 'Review feedback',
    description: 'Responses remain attached to the task and context that produced them.',
    icon: Eye,
    facts: ['CONTEXT / preserved', 'RESPONSES / ordered', 'REVIEW / open'],
  },
  {
    id: '07',
    role: 'OWNER',
    title: 'Approve or reject',
    description: 'A researcher closes the lifecycle with an explicit human decision.',
    icon: CheckCircle2,
    facts: ['EVIDENCE / reviewed', 'DECISION / human', 'STATE / final'],
  },
] as const;

type WorkflowStep = (typeof steps)[number];

function DesktopArtifact({ step, index, progress }: { step: WorkflowStep; index: number; progress: MotionValue<number> }) {
  const total = steps.length;
  const segment = 1 / total;
  const enterAt = index * segment + segment * 0.04;
  const settleAt = index * segment + segment * 0.34;
  const finalX = [-38, -26, -18, -9, 0, 10, 18][index];
  const finalY = [40, 28, 17, 6, -5, -16, -28][index];
  const finalRotate = [-2.6, 1.9, -1.5, 1.1, -0.8, 0.6, 0][index];

  const opacity = useTransform(progress, [enterAt, settleAt, 1], [0, 1, 1]);
  const x = useTransform(progress, [enterAt, settleAt, 1], ['58vw', `${finalX}px`, `${finalX}px`]);
  const y = useTransform(progress, [enterAt, settleAt, 1], [56, finalY, finalY]);
  const rotate = useTransform(progress, [enterAt, settleAt, 1], [index % 2 ? -3.5 : 3.5, finalRotate, finalRotate]);
  const scale = useTransform(progress, [enterAt, settleAt, 1], [0.97, 1, 1]);

  return (
    <motion.article style={{ opacity, x, y, rotate, scale, zIndex: index + 10 }} className="absolute inset-x-0 top-1/2 mx-auto w-full max-w-[610px] -translate-y-1/2 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[rgba(20,23,29,.94)] p-5 text-[var(--lab-bone)] shadow-[0_22px_70px_rgba(0,0,0,.34)] backdrop-blur-xl xl:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="font-research flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[var(--lab-amber)]"><span>{step.role}</span><span className="text-white/25">/</span><span className="text-white/45">{step.id}</span></div>
          <h3 className="font-display mt-2 text-2xl font-semibold tracking-[-0.025em]">{step.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/56">{step.description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-[var(--lab-amber)]"><step.icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-6 border-y border-white/8">
        {step.facts.map((fact) => {
          const [label, value] = fact.split(' / ');
          return (
            <div key={fact} className="flex items-center justify-between gap-6 border-b border-white/8 py-3 last:border-b-0">
              <span className="font-research text-[9px] uppercase tracking-[0.13em] text-white/35">{label}</span>
              <span className="text-xs font-medium text-white/72">{value}</span>
            </div>
          );
        })}
      </div>
      <div className="font-research mt-5 flex items-center justify-between text-[8px] uppercase tracking-[0.15em] text-white/30"><span>Research artifact</span><span>Trace {step.id} / 07</span></div>
    </motion.article>
  );
}

export function WorkflowStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const progressScale = useTransform(scrollYProgress, [0.03, 0.96], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(latest * steps.length)));
    setActiveStepIndex((current) => (current === next ? current : next));
  });

  return (
    <section id="research-flow" ref={sectionRef} className="landing-scene landing-grain relative overflow-hidden bg-[var(--lab-graphite)] py-24 text-[var(--lab-bone)] lg:py-0">
      <div aria-hidden="true" className="absolute left-1/2 top-1/3 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[rgba(201,161,95,.06)] blur-3xl" />
      <div className="container relative mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 xl:gap-24">
        <div className="lg:sticky lg:top-[17vh] lg:self-start lg:py-24">
          <ResearchLabel index="04" label="RESEARCH FLOW" tone="dark" />
          <h2 className="font-display mt-5 max-w-xl text-[clamp(2.6rem,5.1vw,4.1rem)] font-semibold leading-[1] tracking-[-0.045em]">One study.<br /> From setup to evidence.</h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/58 md:text-lg md:leading-8">Follow the research from setup, through the live product, and back into a review-ready submission.</p>
          <div className="mt-9 hidden max-w-sm lg:block">
            <div className="font-research flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-white/38"><span>Setup</span><span>Evidence</span></div>
            <div className="mt-3 h-px bg-white/12"><motion.div className="h-px origin-left bg-[var(--lab-amber)]" style={reduceMotion ? { scaleX: 1 } : { scaleX: progressScale }} /></div>
            <div className="font-research mt-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.11em]"><span className="text-[var(--lab-amber)]">{String(activeStepIndex + 1).padStart(2, '0')} / 07</span><span className="text-white/42">{steps[activeStepIndex].title}</span></div>
          </div>
        </div>

        <div>
          {!reduceMotion && (
            <div className="relative hidden h-[400vh] lg:block">
              <div className="sticky top-20 flex h-[calc(100vh-5rem)] items-center">
                <div className="relative h-[660px] w-full">
                  {steps.map((step, index) => <DesktopArtifact key={step.id} step={step} index={index} progress={scrollYProgress} />)}
                </div>
              </div>
            </div>
          )}

          <div className={`${reduceMotion ? 'hidden lg:block' : ''} py-10 lg:py-24`}>
            <div className="relative space-y-5 lg:hidden">
              <div aria-hidden="true" className="absolute bottom-4 left-[13px] top-4 w-px bg-white/12" />
              {steps.map((step) => (
                <motion.article key={step.id} initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.26 }} transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }} className="relative ml-10 rounded-[1.2rem] border border-white/10 bg-[var(--lab-carbon)] p-5">
                  <div className="absolute -left-[38px] top-6 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[var(--lab-graphite)] text-[var(--lab-amber)]"><step.icon className="h-3.5 w-3.5" /></div>
                  <p className="font-research text-[9px] uppercase tracking-[0.15em] text-[var(--lab-amber)]">{step.id} / {step.role}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{step.description}</p>
                  <div className="mt-4 border-t border-white/8 pt-3">{step.facts.slice(0, 2).map((fact) => <p key={fact} className="font-research mt-2 text-[8px] uppercase tracking-[0.12em] text-white/35">{fact}</p>)}</div>
                </motion.article>
              ))}
            </div>

            {reduceMotion && (
              <div className="hidden space-y-5 lg:block">
                {steps.map((step) => (
                  <article key={step.id} className="rounded-[1.3rem] border border-white/10 bg-[var(--lab-carbon)] p-6">
                    <p className="font-research text-[9px] uppercase tracking-[0.15em] text-[var(--lab-amber)]">{step.id} / {step.role}</p>
                    <h3 className="font-display mt-2 text-2xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-white/55">{step.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
