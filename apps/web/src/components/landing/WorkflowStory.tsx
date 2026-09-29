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
  CheckCircle,
  CheckSquare,
  Eye,
  MessageSquare,
  Monitor,
  MousePointerClick,
  PlusCircle,
} from 'lucide-react';

const steps = [
  {
    id: '01',
    role: 'OWNER',
    title: 'Create study',
    description: 'Set the target URL and define the tasks.',
    icon: PlusCircle,
    kind: 'create',
  },
  {
    id: '02',
    role: 'TESTER',
    title: 'Claim session',
    description: 'A tester picks an available study.',
    icon: MousePointerClick,
    kind: 'claim',
  },
  {
    id: '03',
    role: 'BROWSER',
    title: 'Open live site',
    description: 'The extension activates on the matched URL.',
    icon: Monitor,
    kind: 'browser',
  },
  {
    id: '04',
    role: 'EXTENSION',
    title: 'Complete tasks',
    description: 'The tester follows prompts and leaves feedback in context.',
    icon: CheckSquare,
    kind: 'tasks',
  },
  {
    id: '05',
    role: 'TESTER',
    title: 'Submit responses',
    description: 'Completed answers are sent back as one submission.',
    icon: MessageSquare,
    kind: 'submit',
  },
  {
    id: '06',
    role: 'OWNER',
    title: 'Review feedback',
    description: 'The owner reads responses task by task.',
    icon: Eye,
    kind: 'review',
  },
  {
    id: '07',
    role: 'OWNER',
    title: 'Approve or reject',
    description: 'Close the loop with a clear final decision.',
    icon: CheckCircle,
    kind: 'decision',
  },
] as const;

type WorkflowStep = (typeof steps)[number];

function roleClass(role: WorkflowStep['role']) {
  if (role === 'OWNER') return 'text-primary';
  if (role === 'TESTER') return 'text-orange-500';
  return 'text-cyan-400';
}

function MockupBody({ step }: { step: WorkflowStep }) {
  switch (step.kind) {
    case 'create':
      return (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Target URL</p>
            <div className="mt-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground">
              https://example.com/checkout
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Tasks</p>
            <div className="mt-2 space-y-2">
              {['Find the pricing page', 'Choose a plan', 'Start checkout'].map((task, index) => (
                <div key={task} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-xs text-foreground">{task}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-primary px-4 py-3 text-center text-xs font-semibold text-white">Launch study</div>
        </div>
      );

    case 'claim':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="text-xs font-semibold text-foreground">Checkout Flow Test</p>
              <p className="mt-1 text-[11px] text-muted">example.com · 3 tasks</p>
            </div>
            <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-500">AVAILABLE</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-muted">Estimated time</p>
              <p className="mt-1 font-semibold text-foreground">8–10 min</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-muted">Tasks</p>
              <p className="mt-1 font-semibold text-foreground">3 steps</p>
            </div>
          </div>
          <div className="rounded-xl bg-primary px-4 py-3 text-center text-xs font-semibold text-white">Claim session</div>
        </div>
      );

    case 'browser':
      return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="h-2 w-2 rounded-full bg-warning-text" />
            <span className="h-2 w-2 rounded-full bg-success-text" />
            <div className="ml-2 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted">
              example.com/checkout
            </div>
          </div>
          <div className="grid min-h-48 grid-cols-[1fr_0.72fr] gap-3 p-4">
            <div className="space-y-3">
              <div className="h-4 w-1/2 rounded bg-border" />
              <div className="h-16 rounded-xl bg-background" />
              <div className="h-14 rounded-xl bg-background" />
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Matched URL</p>
              <p className="mt-2 text-xs font-semibold text-foreground">Extension ready</p>
              <p className="mt-2 text-[11px] leading-5 text-muted">This page matches the claimed study.</p>
              <div className="mt-4 rounded-lg bg-primary px-3 py-2 text-center text-[10px] font-semibold text-white">Start task</div>
            </div>
          </div>
        </div>
      );

    case 'tasks':
      return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <span className="text-xs font-semibold">Testing Platform</span>
            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold">2 / 3</span>
          </div>
          <div className="p-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Current task</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Choose the plan that best fits a small team.</p>
            <div className="mt-4 min-h-20 rounded-xl border border-border bg-background p-3 text-[11px] leading-5 text-muted">
              I expected the support details to be closer to the plan name.
            </div>
            <div className="mt-3 rounded-xl bg-primary px-4 py-3 text-center text-xs font-semibold text-white">Complete task</div>
          </div>
        </div>
      );

    case 'submit':
      return (
        <div className="space-y-3">
          {['Pricing page found', 'Plan selected', 'Checkout started'].map((label) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
              <CheckCircle className="h-4 w-4 text-success-text" />
              <span className="text-xs text-foreground">{label}</span>
            </div>
          ))}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-foreground">Ready to submit</p>
            <p className="mt-1 text-[11px] leading-5 text-muted">All task responses will be sent back as one submission.</p>
          </div>
          <div className="rounded-xl bg-primary px-4 py-3 text-center text-xs font-semibold text-white">Submit responses</div>
        </div>
      );

    case 'review':
      return (
        <div className="space-y-3">
          {[
            ['Task 1', 'Pricing was easy to find, but plan differences needed a second read.'],
            ['Task 2', 'The checkout button was clear; I hesitated on the support details.'],
          ].map(([label, response]) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <span className="text-[10px] font-bold text-primary">RESPONSE</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted">{response}</p>
            </div>
          ))}
          <div className="rounded-xl border border-border bg-background p-3 text-[11px] text-muted">
            3 tasks completed · submission received
          </div>
        </div>
      );

    case 'decision':
      return (
        <div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Tester submission</p>
                <p className="mt-1 text-[11px] text-muted">Checkout Flow Test · 3 responses</p>
              </div>
              <span className="rounded-full bg-warning-bg px-2.5 py-1 text-[10px] font-bold text-warning-text">SUBMITTED</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
              {['3 / 3 tasks', '8m 42s', 'Ready'].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-background px-2 py-2 text-muted">{item}</div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-center text-xs font-semibold text-foreground">Reject</div>
            <div className="rounded-xl bg-primary px-4 py-3 text-center text-xs font-semibold text-white">Approve</div>
          </div>
        </div>
      );
  }
}

function DesktopWorkflowCard({
  step,
  index,
  progress,
}: {
  step: WorkflowStep;
  index: number;
  progress: MotionValue<number>;
}) {
  const total = steps.length;
  const segment = 1 / total;
  const slotStart = index * segment;
  const enterAt = slotStart + segment * 0.02;
  const settleAt = slotStart + segment * 0.3;

  // Three-beat rhythm per card:
  // 1) transition in, 2) arrive on point, 3) hold.
  // Waiting cards stay fully invisible and parked beyond the right edge.
  // Once settled, a card remains fully opaque for the rest of the story.
  const finalX = [-34, -18, -28, -14, -22, -10, 0][index];
  const finalY = [26, 18, 10, 0, -8, -16, 0][index];
  const finalRotate = [-4, 3, -2.5, 2, -3, 1.5, 0][index];

  const opacity = useTransform(
    progress,
    [enterAt, settleAt, 1],
    [0, 1, 1],
  );
  const x = useTransform(
    progress,
    [enterAt, settleAt, 1],
    ['72vw', `${finalX}px`, `${finalX}px`],
  );
  const y = useTransform(
    progress,
    [enterAt, settleAt, 1],
    [64, finalY, finalY],
  );
  const scale = useTransform(
    progress,
    [enterAt, settleAt, 1],
    [0.96, 1, 1],
  );
  const rotate = useTransform(
    progress,
    [enterAt, settleAt, 1],
    [index % 2 === 0 ? 5.5 : -5.5, finalRotate, finalRotate],
  );

  return (
    <motion.article
      style={{ opacity, x, y, scale, rotate, zIndex: index + 10 }}
      className="absolute inset-x-0 top-1/2 mx-auto w-full max-w-[620px] -translate-y-1/2 rounded-[2rem] border border-border bg-background/98 p-5 shadow-[0_18px_48px_rgba(2,6,23,0.18)] backdrop-blur-md xl:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
            <span className={roleClass(step.role)}>{step.role}</span>
            <span className="text-muted/55">{step.id}</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">{step.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
          <step.icon className="h-4 w-4" />
        </div>
      </div>
      <MockupBody step={step} />
    </motion.article>
  );
}

function StaticDesktopCard({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
            <span className={roleClass(step.role)}>{step.role}</span>
            <span className="text-muted/55">{step.id}</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
        </div>
        <span className="text-xs font-semibold text-muted">0{index + 1}</span>
      </div>
      <MockupBody step={step} />
    </article>
  );
}

export function WorkflowStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progressScale = useTransform(scrollYProgress, [0.04, 0.96], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextIndex = Math.min(steps.length - 1, Math.max(0, Math.floor(latest * steps.length)));
    setActiveStepIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const activeStep = steps[activeStepIndex];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative border-y border-border bg-surface py-20 md:py-24 lg:py-0"
    >
      <div className="container mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 xl:gap-24">
        <div className="lg:sticky lg:top-[18vh] lg:self-start lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.55rem] lg:leading-[1.02]">
            One study. From setup to decision.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted md:text-lg md:leading-8">
            Owners launch a test, testers complete it on the live site, and responses return as a review-ready submission.
          </p>

          <div className="mt-8 hidden max-w-sm lg:block">
            <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              <span className="whitespace-nowrap">Setup</span>
              <span className="whitespace-nowrap text-right">Decision</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                style={reduceMotion ? { scaleX: 1 } : { scaleX: progressScale }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs leading-5">
              <span className="font-semibold text-foreground">{activeStepIndex + 1}/7</span>
              <span className="text-muted">{activeStep.title}</span>
            </div>
          </div>
        </div>

        <div>
          {!reduceMotion && (
            <div className="relative hidden h-[410vh] lg:block">
              <div className="sticky top-20 flex h-[calc(100vh-5rem)] items-center">
                <div className="relative h-[660px] w-full">
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl"
                  />
                  {steps.map((step, index) => (
                    <DesktopWorkflowCard
                      key={step.id}
                      step={step}
                      index={index}
                      progress={scrollYProgress}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {reduceMotion && (
            <div className="hidden space-y-6 py-24 lg:block">
              {steps.map((step, index) => (
                <StaticDesktopCard key={step.id} step={step} index={index} />
              ))}
            </div>
          )}

          <div className="relative mt-14 lg:hidden">
            <div className="absolute bottom-0 left-[15px] top-0 w-px bg-border" />
            <div className="space-y-6 pl-10">
              {steps.map((step, index) => (
                <motion.article
                  key={step.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.24 }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-[1.6rem] border border-border bg-background p-4 shadow-sm sm:p-5"
                >
                  <div className="absolute -left-[34px] top-6 flex h-7 w-7 items-center justify-center rounded-full border-4 border-surface bg-background text-primary shadow-sm">
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                        <span className={roleClass(step.role)}>{step.role}</span>
                        <span className="text-muted/55">{step.id}</span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-muted">0{index + 1}</span>
                  </div>
                  <MockupBody step={step} />
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
