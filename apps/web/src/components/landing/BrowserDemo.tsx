'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import Image from 'next/image';
import { Check, MousePointer2 } from 'lucide-react';

type Point = {
  x: number;
  y: number;
};

type PlanCardProps = {
  title: string;
  eyebrow: string;
  range: string;
  speed: string;
  feature: string;
  price: string;
  monthly: string;
  selected?: boolean;
  targetRef?: Ref<HTMLSpanElement>;
};

const plans: Omit<PlanCardProps, 'selected' | 'targetRef'>[] = [
  {
    title: 'MOVE URBAN',
    eyebrow: 'Everyday',
    range: '40 km',
    speed: '25 km/h',
    feature: 'Essential utility',
    price: '€1,499',
    monthly: '€45/mo',
  },
  {
    title: 'MOVE PRO',
    eyebrow: 'Performance',
    range: '70 km',
    speed: '32 km/h',
    feature: 'Adaptive suspension',
    price: '€2,199',
    monthly: '€65/mo',
  },
  {
    title: 'MOVE STUDIO',
    eyebrow: 'Modular',
    range: '70 km+',
    speed: '32 km/h',
    feature: 'Cargo-ready shell',
    price: '€2,999+',
    monthly: '€89/mo',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pointInside(container: HTMLElement, target: HTMLElement, padding = 28): Point {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return {
    x: clamp(
      targetRect.left - containerRect.left + targetRect.width / 2,
      padding,
      Math.max(padding, containerRect.width - padding)
    ),
    y: clamp(
      targetRect.top - containerRect.top + targetRect.height / 2,
      padding,
      Math.max(padding, containerRect.height - padding)
    ),
  };
}

function PlanCard({
  title,
  eyebrow,
  range,
  speed,
  feature,
  price,
  monthly,
  selected = false,
  targetRef,
}: PlanCardProps) {
  return (
    <motion.div
      animate={selected ? { y: -5, scale: 1.012 } : { y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`relative min-w-0 overflow-hidden rounded-[1.2rem] border p-3 shadow-[0_20px_48px_rgba(16,18,22,.08)] transition-[border-color,background-color,box-shadow] duration-300 sm:p-4 lg:rounded-[1.35rem] lg:p-5 ${
        selected
          ? 'border-[rgba(201,161,95,.95)] bg-[rgba(255,252,245,.98)] shadow-[0_0_0_1px_rgba(201,161,95,.3),0_28px_62px_rgba(97,72,34,.14)]'
          : 'border-[rgba(17,18,21,.10)] bg-[rgba(255,255,255,.78)]'
      }`}
    >
      <span
        ref={targetRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[56%] h-px w-px -translate-x-1/2 -translate-y-1/2"
      />

      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[2px] origin-left transition-transform duration-500 ${
          selected ? 'scale-x-100 bg-[var(--lab-amber)]' : 'scale-x-0 bg-transparent'
        }`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[rgba(17,18,21,.38)] sm:text-[9px] lg:text-[10px]">
            {eyebrow}
          </p>
          <h4 className="mt-1 truncate text-[clamp(.82rem,1.45vw,1.35rem)] font-semibold tracking-[-0.035em] text-[rgba(17,18,21,.84)]">
            {title}
          </h4>
        </div>

        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 lg:h-7 lg:w-7 ${
            selected
              ? 'border-[var(--lab-amber)] bg-[var(--lab-graphite)] text-white'
              : 'border-[rgba(17,18,21,.10)] bg-[rgba(255,255,255,.6)] text-transparent'
          }`}
        >
          <Check className="h-3 w-3 lg:h-3.5 lg:w-3.5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-[9px] leading-4 text-[rgba(17,18,21,.54)] sm:text-[10px] lg:mt-5 lg:text-xs lg:leading-5">
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(17,18,21,.08)] pb-2">
          <span>Range</span>
          <strong className="font-medium text-[rgba(17,18,21,.74)]">{range}</strong>
        </div>
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(17,18,21,.08)] pb-2">
          <span>Max speed</span>
          <strong className="font-medium text-[rgba(17,18,21,.74)]">{speed}</strong>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Character</span>
          <strong className="truncate font-medium text-[rgba(17,18,21,.74)]">{feature}</strong>
        </div>
      </div>

      <div className="mt-4 border-t border-[rgba(17,18,21,.08)] pt-3 lg:mt-5 lg:pt-4">
        <p className="whitespace-nowrap text-[clamp(.92rem,1.7vw,1.55rem)] font-semibold tracking-[-0.045em] text-[rgba(17,18,21,.86)]">
          {price}
          <span className="ml-1 text-[.7em] font-normal tracking-[-0.02em] text-[rgba(17,18,21,.5)]">
            or {monthly}
          </span>
        </p>
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-3 top-3 hidden rounded-full bg-[var(--lab-graphite)] px-3 py-1.5 text-[9px] font-semibold text-[var(--lab-bone)] shadow-lg lg:inline-flex"
        >
          Selected
        </motion.div>
      )}
    </motion.div>
  );
}

export function BrowserDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const proTargetRef = useRef<HTMLSpanElement>(null);
  const completeTargetRef = useRef<HTMLSpanElement>(null);

  const reduceMotion = useReducedMotion();

  const [selected, setSelected] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [targetsReady, setTargetsReady] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 90, y: 110 });
  const [proPoint, setProPoint] = useState<Point>({ x: 520, y: 560 });
  const [completePoint, setCompletePoint] = useState<Point>({ x: 1180, y: 620 });

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  const frameScale = useTransform(scrollYProgress, [0, 0.12, 1], [0.965, 1, 1]);
  const frameY = useTransform(scrollYProgress, [0, 0.14, 1], [34, 0, 0]);

  const panelX = useTransform(scrollYProgress, [0.05, 0.2, 1], [44, 0, 0]);
  const panelOpacity = useTransform(scrollYProgress, [0.04, 0.18, 1], [0, 1, 1]);

  const feedbackOpacity = useTransform(scrollYProgress, [0.44, 0.58, 1], [0, 1, 1]);
  const feedbackY = useTransform(scrollYProgress, [0.44, 0.58, 1], [10, 0, 0]);

  const progressScale = useTransform(scrollYProgress, [0.08, 0.84], [0.12, 1]);

  const cursorX = useTransform(
    scrollYProgress,
    [0, 0.12, 0.27, 0.36, 0.52, 0.69, 0.77, 1],
    [
      startPoint.x,
      startPoint.x,
      proPoint.x,
      proPoint.x,
      proPoint.x,
      completePoint.x,
      completePoint.x,
      completePoint.x,
    ]
  );

  const cursorY = useTransform(
    scrollYProgress,
    [0, 0.12, 0.27, 0.36, 0.52, 0.69, 0.77, 1],
    [
      startPoint.y,
      startPoint.y,
      proPoint.y,
      proPoint.y,
      proPoint.y,
      completePoint.y,
      completePoint.y,
      completePoint.y,
    ]
  );

  const cursorScale = useTransform(
    scrollYProgress,
    [0.3, 0.33, 0.36, 0.71, 0.74, 0.77, 1],
    [1, 0.78, 1, 1, 0.78, 1, 1]
  );

  const cursorOpacity = useTransform(scrollYProgress, [0.06, 0.14, 1], [0, 1, 1]);

  const clickRingOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.33, 0.39, 0.7, 0.74, 0.8],
    [0, 0.95, 0, 0, 0.95, 0]
  );

  const clickRingScale = useTransform(
    scrollYProgress,
    [0.3, 0.33, 0.39, 0.7, 0.74, 0.8],
    [0.55, 1, 1.85, 0.55, 1, 1.85]
  );

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setSelected(latest >= 0.35);
    setCompleted(latest >= 0.76);
  });

  useLayoutEffect(() => {
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const surface = surfaceRef.current;
        const proTarget = proTargetRef.current;
        const completeTarget = completeTargetRef.current;

        if (!surface || !proTarget || !completeTarget) {
          setTargetsReady(false);
          return;
        }

        const bounds = surface.getBoundingClientRect();

        setStartPoint({
          x: clamp(bounds.width * 0.08, 42, Math.max(42, bounds.width - 42)),
          y: clamp(bounds.height * 0.14, 56, Math.max(56, bounds.height - 56)),
        });
        setProPoint(pointInside(surface, proTarget, 34));
        setCompletePoint(pointInside(surface, completeTarget, 34));
        setTargetsReady(true);
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    if (surfaceRef.current) resizeObserver.observe(surfaceRef.current);
    if (proTargetRef.current) resizeObserver.observe(proTargetRef.current);
    if (completeTargetRef.current) resizeObserver.observe(completeTargetRef.current);

    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const displaySelected = Boolean(reduceMotion) || selected;
  const displayCompleted = Boolean(reduceMotion) || completed;

  return (
    <section
      id="in-context"
      className="landing-scene landing-grain relative bg-[var(--lab-graphite)] text-[var(--lab-bone)]"
    >
      <div className="mx-auto flex min-h-[64vh] max-w-6xl items-end px-6 pb-16 pt-24 md:min-h-[72vh] md:pb-20 md:pt-32 lg:min-h-[78vh]">
        <div className="max-w-4xl">
          <h2 className="font-display text-[clamp(2.9rem,7.5vw,6.5rem)] font-semibold leading-[0.93] tracking-[-0.055em]">
            Keep the task
            <br /> beside the experience.
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/56 md:text-xl md:leading-8">
            The tester works on the real target while instructions, progress, and feedback stay in context.
          </p>
        </div>
      </div>

      <div ref={stageRef} className="landing-pin-browser relative lg:min-h-[285vh]">
        <div className="landing-pinned-stage relative px-2 pb-8 sm:px-4 md:px-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:justify-center lg:overflow-hidden lg:py-2">
          <motion.div
            style={reduceMotion ? undefined : { scale: frameScale, y: frameY }}
            className="relative mx-auto min-h-[760px] w-full max-w-[1580px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--lab-carbon)] shadow-[0_50px_150px_rgba(0,0,0,.5)] lg:h-[94vh] lg:min-h-0 lg:rounded-[1.8rem]"
          >
            <div className="flex h-11 items-center gap-3 border-b border-[rgba(17,18,21,.10)] bg-[#d9d3c8] px-4 md:h-12">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[rgba(155,95,80,.75)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[rgba(185,148,85,.75)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[rgba(116,129,111,.75)]" />
              </div>

              <div className="mx-auto flex h-7 w-[66%] max-w-xl items-center rounded-lg border border-[rgba(17,18,21,.10)] bg-[rgba(255,255,255,.62)] px-3 text-[9px] text-[rgba(17,18,21,.42)] md:h-8">
                omnis-move.example/configurator
              </div>

              <div className="hidden text-[9px] font-medium uppercase tracking-[0.11em] text-[rgba(17,18,21,.36)] sm:block">
                Live target
              </div>
            </div>

            <div
              ref={surfaceRef}
              className="relative min-h-[716px] overflow-hidden bg-[#ece8df] lg:h-[calc(100%-3rem)] lg:min-h-0"
            >
              <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src="/home_image/target_website_pricing_001.webp"
                  alt=""
                  fill
                  sizes="100vw"
                  className="scale-[1.025] object-cover opacity-[0.1]"
                  style={{ objectPosition: '50% 48%' }}
                />
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(242,238,229,.82),rgba(232,226,216,.9))]"
              />

              <div
                aria-hidden="true"
                className="absolute -left-24 top-[12%] z-[1] h-72 w-72 rounded-full bg-[rgba(201,161,95,.10)] blur-3xl"
              />

              <div
                className="absolute inset-4 z-10 overflow-hidden rounded-[1.35rem] border border-[rgba(17,18,21,.08)] bg-[rgba(248,245,238,.94)] shadow-[0_24px_70px_rgba(24,22,18,.12)] backdrop-blur-sm sm:inset-5 md:inset-6"
              >
                <div className="grid h-full min-h-[680px] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
                  <div className="flex min-w-0 flex-col px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6 md:px-8 md:pb-7 md:pt-7 lg:px-9 lg:pb-7 lg:pt-7 xl:px-11 xl:pt-9">
                    <div className="flex items-start justify-between gap-6">
                      <div className="max-w-[720px]">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[rgba(17,18,21,.38)] sm:text-[10px]">
                          OMNIS MOVE / CONFIGURATOR
                        </p>

                        <h3 className="mt-4 max-w-[690px] text-[clamp(2rem,4vw,4.5rem)] font-medium leading-[0.94] tracking-[-0.052em] text-[rgba(17,18,21,.88)]">
                          Configure the ride
                          <br className="hidden sm:block" /> around your day.
                        </h3>

                        <p className="mt-4 max-w-[520px] text-xs leading-5 text-[rgba(17,18,21,.52)] sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                          Compare range, speed, and everyday use across three mobility configurations.
                        </p>
                      </div>

                      <div className="hidden shrink-0 gap-2 xl:flex">
                        <span className="rounded-full border border-[rgba(17,18,21,.08)] bg-[rgba(255,255,255,.65)] px-3 py-2 text-[9px] font-medium uppercase tracking-[0.11em] text-[rgba(17,18,21,.42)]">
                          Electric
                        </span>
                        <span className="rounded-full border border-[rgba(17,18,21,.08)] bg-[rgba(255,255,255,.65)] px-3 py-2 text-[9px] font-medium uppercase tracking-[0.11em] text-[rgba(17,18,21,.42)]">
                          Modular
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4 border-y border-[rgba(17,18,21,.08)] py-3 text-[9px] uppercase tracking-[0.11em] text-[rgba(17,18,21,.38)] sm:text-[10px] lg:mt-7">
                      <span className="font-semibold text-[rgba(17,18,21,.62)]">Three configurations</span>
                      <span className="h-px flex-1 bg-[rgba(17,18,21,.08)]" />
                      <span>One live decision</span>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-2 pt-6 sm:gap-3 lg:gap-4 lg:pt-7">
                      <PlanCard {...plans[0]} />
                      <PlanCard
                        {...plans[1]}
                        selected={displaySelected}
                        targetRef={proTargetRef}
                      />
                      <PlanCard {...plans[2]} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 text-[8px] uppercase tracking-[0.12em] text-[rgba(17,18,21,.3)] sm:text-[9px]">
                      <span>Pricing shown for research prototype only</span>
                      <span className="hidden sm:inline">Support · financing · configuration</span>
                    </div>
                  </div>

                  <div className="hidden border-l border-[rgba(17,18,21,.08)] bg-[rgba(255,255,255,.34)] px-7 py-8 lg:block">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[rgba(17,18,21,.32)]">
                      PRODUCT SUPPORT
                    </p>

                    <div className="mt-7 space-y-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.11em] text-[rgba(17,18,21,.3)]">Assistance</p>
                        <p className="mt-2 text-sm font-medium text-[rgba(17,18,21,.7)]">Movement Experts</p>
                        <p className="mt-1 text-xs leading-5 text-[rgba(17,18,21,.44)]">
                          Configuration guidance for first-time riders.
                        </p>
                      </div>

                      <div className="h-px bg-[rgba(17,18,21,.08)]" />

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.11em] text-[rgba(17,18,21,.3)]">Ownership</p>
                        <p className="mt-2 text-sm font-medium text-[rgba(17,18,21,.7)]">Service & warranty</p>
                        <p className="mt-1 text-xs leading-5 text-[rgba(17,18,21,.44)]">
                          Coverage, maintenance, and accessory support.
                        </p>
                      </div>

                      <div className="h-px bg-[rgba(17,18,21,.08)]" />

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.11em] text-[rgba(17,18,21,.3)]">Resources</p>
                        <p className="mt-2 text-sm font-medium text-[rgba(17,18,21,.7)]">FAQs & specifications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.aside
                aria-hidden="true"
                style={reduceMotion ? undefined : { x: panelX, opacity: panelOpacity }}
                className="absolute bottom-5 left-5 right-5 z-40 overflow-hidden rounded-[1.2rem] border border-white/10 bg-[rgba(11,13,18,.92)] text-[var(--lab-bone)] shadow-[0_30px_80px_rgba(0,0,0,.36)] backdrop-blur-xl sm:left-auto sm:right-7 sm:top-7 sm:bottom-auto sm:w-[350px]"
              >
                <motion.div
                  style={reduceMotion ? { scaleX: 1 } : { scaleX: progressScale }}
                  className="h-[2px] origin-left bg-[var(--lab-amber)]"
                />

                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.11em] text-white/40">
                      Task 2 of 3
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-[-0.015em]">
                      Find the Pro plan
                    </p>
                  </div>

                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                      displayCompleted
                        ? 'bg-[var(--lab-sage)]'
                        : displaySelected
                          ? 'bg-[var(--lab-amber)]'
                          : 'bg-white/25'
                    }`}
                  />
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-sm leading-6 text-white/60">
                    Choose the configuration that best fits a small team needing more range and performance.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-white/40">Selection</span>
                      <span
                        className={`text-xs font-semibold ${
                          displaySelected ? 'text-[var(--lab-amber)]' : 'text-white/35'
                        }`}
                      >
                        {displaySelected ? 'MOVE PRO' : 'Waiting…'}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    style={reduceMotion ? undefined : { opacity: feedbackOpacity, y: feedbackY }}
                    className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.11em] text-white/30">
                      Think-aloud note
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      “The extra range feels worth it. I looked here after comparing all three plans.”
                    </p>
                  </motion.div>

                  <div
                    className={`relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3 text-xs font-semibold transition-[background-color,color,box-shadow] duration-300 ${
                      displayCompleted
                        ? 'bg-[var(--lab-sage)] text-white shadow-[0_10px_28px_rgba(127,137,120,.22)]'
                        : displaySelected
                          ? 'bg-[var(--lab-bone)] text-[var(--lab-graphite)]'
                          : 'bg-white/10 text-white/35'
                    }`}
                  >
                    <span
                      ref={completeTargetRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2"
                    />

                    {displayCompleted ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Task complete
                      </>
                    ) : (
                      'Complete task'
                    )}

                    {displayCompleted && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.55 }}
                        animate={{ opacity: [0, 0.45, 0], scale: [0.55, 1.5, 2] }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                        className="pointer-events-none absolute inset-0 rounded-full border border-white/65"
                      />
                    )}
                  </div>
                </div>
              </motion.aside>

              {!reduceMotion && targetsReady && (
                <motion.div
                  aria-hidden="true"
                  style={{
                    x: cursorX,
                    y: cursorY,
                    scale: cursorScale,
                    opacity: cursorOpacity,
                  }}
                  className="pointer-events-none absolute left-0 top-0 z-50 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(17,18,21,.14)] bg-[rgba(250,247,239,.96)] text-[var(--lab-graphite)] shadow-[0_8px_26px_rgba(0,0,0,.22)] backdrop-blur md:flex"
                >
                  <motion.span
                    style={{
                      opacity: clickRingOpacity,
                      scale: clickRingScale,
                    }}
                    className="absolute inset-0 rounded-full border border-[var(--lab-amber)]"
                  />
                  <MousePointer2 className="relative z-10 h-4 w-4" />
                </motion.div>
              )}

              <div className="pointer-events-none absolute bottom-4 left-5 z-50 hidden text-[8px] font-medium uppercase tracking-[0.12em] text-[rgba(17,18,21,.34)] md:block">
                {displayCompleted
                  ? 'Task complete · cursor held on final action'
                  : displaySelected
                    ? 'Move Pro selected · continue the task'
                    : 'Live target · compare the plans'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
