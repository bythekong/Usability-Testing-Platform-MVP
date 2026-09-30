'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Check, MousePointer2 } from 'lucide-react';
import { EditorialImage } from './EditorialImage';

export function BrowserDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [autoSelected, setAutoSelected] = useState(false);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [manualSelected, setManualSelected] = useState(false);
  const [manualCompleted, setManualCompleted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  const frameScale = useTransform(scrollYProgress, [0, 0.16, 1], [0.96, 1, 1]);
  const frameY = useTransform(scrollYProgress, [0, 0.18, 1], [36, 0, 0]);
  const panelX = useTransform(scrollYProgress, [0.08, 0.28], [52, 0]);
  const panelOpacity = useTransform(scrollYProgress, [0.06, 0.22], [0, 1]);
  const cursorLeft = useTransform(
    scrollYProgress,
    [0.12, 0.3, 0.44, 0.58, 0.74, 0.9],
    ['9%', '38%', '38%', '76%', '76%', '84%']
  );
  const cursorTop = useTransform(
    scrollYProgress,
    [0.12, 0.3, 0.44, 0.58, 0.74, 0.9],
    ['16%', '74%', '74%', '40%', '76%', '82%']
  );
  const cursorScale = useTransform(
    scrollYProgress,
    [0.27, 0.31, 0.35, 0.71, 0.75, 0.79],
    [1, 0.82, 1, 1, 0.82, 1]
  );
  const feedbackOpacity = useTransform(scrollYProgress, [0.48, 0.62], [0, 1]);
  const feedbackY = useTransform(scrollYProgress, [0.48, 0.62], [12, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setAutoSelected(latest >= 0.34);
    setAutoCompleted(latest >= 0.77);
  });

  const selected = manualSelected || autoSelected;
  const completed = manualCompleted || autoCompleted;

  function selectPro() {
    setManualSelected(true);
  }

  function completeTask() {
    setManualSelected(true);
    setManualCompleted(true);
  }

  return (
    <section id="in-context" className="landing-scene landing-grain bg-[var(--lab-graphite)] text-[var(--lab-bone)]">
      <div className="mx-auto flex min-h-[62vh] max-w-6xl items-end px-6 pb-16 pt-24 md:min-h-[72vh] md:pb-20 md:pt-32 lg:min-h-[78vh]">
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

      <div ref={stageRef} className="landing-pin-browser relative min-h-[240vh] overflow-clip">
        <div className="landing-pinned-stage sticky top-0 flex h-screen items-center justify-center overflow-hidden px-2 py-2 sm:px-4 md:px-6">
          <motion.div
            style={reduceMotion ? undefined : { scale: frameScale, y: frameY }}
            className="relative h-[94vh] w-full max-w-[1540px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--lab-carbon)] shadow-[0_50px_150px_rgba(0,0,0,.5)] md:h-[92vh] md:rounded-[1.8rem]"
          >
            <div className="flex h-11 items-center gap-3 border-b border-black/10 bg-[#dcd6cc] px-4 md:h-12">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a96550]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#c9a15f]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7f8978]/80" />
              </div>
              <div className="mx-auto flex h-7 w-[64%] max-w-xl items-center rounded-lg border border-black/10 bg-white/60 px-3 font-research text-[8px] text-black/45 md:h-8 md:text-[9px]">
                https://acme-corp.com/pricing
              </div>
            </div>

            <div className="relative h-[calc(100%-2.75rem)] bg-[#efeae1] md:h-[calc(100%-3rem)]">
              <EditorialImage
                src="/home_image/target_website_pricing_001.webp"
                alt="A fictional mobility product pricing page used as the live target during a usability test."
                sizes="100vw"
                className="absolute inset-0 h-full w-full rounded-none"
                imageClassName="object-cover"
                objectPosition="50% 50%"
                overlay={false}
              />

              <button
                type="button"
                aria-label={selected ? 'Move Pro plan selected' : 'Select the Move Pro plan'}
                aria-pressed={selected}
                onClick={selectPro}
                className={`absolute left-[27.5%] top-[61%] z-10 h-[31%] w-[22%] rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 ${
                  selected
                    ? 'bg-[rgba(201,161,95,.12)] ring-2 ring-[var(--lab-amber)] shadow-[0_0_0_6px_rgba(201,161,95,.08)]'
                    : 'bg-transparent hover:bg-white/[0.08] hover:ring-1 hover:ring-black/20'
                }`}
              >
                <span className="sr-only">Move Pro plan hotspot</span>
                {selected && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--lab-graphite)] px-3 py-1.5 text-[10px] font-semibold text-[var(--lab-bone)] shadow-lg">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Selected
                  </span>
                )}
              </button>

              <motion.aside
                style={reduceMotion ? undefined : { x: panelX, opacity: panelOpacity }}
                className="absolute bottom-4 left-4 right-4 z-20 overflow-hidden rounded-[1.2rem] border border-white/10 bg-[rgba(11,13,18,.92)] text-[var(--lab-bone)] shadow-[0_28px_70px_rgba(0,0,0,.42)] backdrop-blur-xl md:bottom-auto md:left-auto md:right-5 md:top-5 md:w-[350px] lg:right-7 lg:top-7"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-xs text-white/44">Task 2 of 3</p>
                    <p className="mt-1 text-base font-semibold">Find the Pro plan</p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${completed ? 'bg-[var(--lab-sage)]' : selected ? 'bg-[var(--lab-amber)]' : 'bg-white/25'}`} />
                </div>

                <div className="p-4 md:p-5">
                  <p className="text-sm leading-6 text-white/62">
                    Choose the plan that best fits a small team, then complete the task.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-white/42">Selection</span>
                      <span className={`text-xs font-semibold ${selected ? 'text-[var(--lab-amber)]' : 'text-white/34'}`}>
                        {selected ? 'MOVE PRO' : 'Waiting…'}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    style={reduceMotion ? undefined : { opacity: feedbackOpacity, y: feedbackY }}
                    className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <p className="text-xs leading-5 text-white/52">
                      The plans are easy to scan, but I expected support details closer to the plan name.
                    </p>
                  </motion.div>

                  <button
                    type="button"
                    onClick={completeTask}
                    disabled={!selected || completed}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed ${
                      completed
                        ? 'bg-[var(--lab-sage)] text-white'
                        : selected
                          ? 'bg-[var(--lab-bone)] text-[var(--lab-graphite)] hover:-translate-y-0.5'
                          : 'bg-white/10 text-white/32'
                    }`}
                  >
                    {completed ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Task completed
                      </>
                    ) : (
                      'Complete task'
                    )}
                  </button>
                </div>
              </motion.aside>

              {!reduceMotion && (
                <motion.div
                  aria-hidden="true"
                  style={{ left: cursorLeft, top: cursorTop, scale: cursorScale }}
                  className="pointer-events-none absolute z-30 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/12 bg-[rgba(243,239,231,.9)] text-[var(--lab-graphite)] shadow-[0_8px_24px_rgba(0,0,0,.2)] backdrop-blur md:flex"
                >
                  <MousePointer2 className="h-4 w-4" />
                </motion.div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-20 bg-gradient-to-t from-black/18 to-transparent" />
            </div>

            <div className="pointer-events-none absolute bottom-4 left-5 z-30 hidden font-research text-[8px] uppercase tracking-[0.12em] text-white/50 md:block">
              {completed ? 'Task complete · evidence returned' : selected ? 'Move Pro selected · continue the task' : 'Live target · choose a plan'}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
