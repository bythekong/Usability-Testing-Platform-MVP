'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Check, Mic2 } from 'lucide-react';
import { EditorialImage } from './EditorialImage';
import { TypeLine } from './TypeLine';

const criteria = [
  ['Mobile banking experience', 'MATCH'],
  ['Android user', 'MATCH'],
  ['Think-aloud preference', 'AVAILABLE'],
  ['Previous product usage', 'NONE'],
];

export function QualificationStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [revealedCriteria, setRevealedCriteria] = useState(1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.48, 1], [0.985, 1, 1.015]);
  const panelY = useTransform(scrollYProgress, [0.08, 0.42, 0.9], [44, 0, -18]);
  const panelOpacity = useTransform(scrollYProgress, [0.04, 0.24, 1], [0.62, 1, 1]);
  const transcriptOpacity = useTransform(scrollYProgress, [0.12, 0.3], [0, 1]);
  const transcriptY = useTransform(scrollYProgress, [0.12, 0.3], [10, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.min(criteria.length, Math.max(1, Math.floor(latest * criteria.length * 1.22) + 1));
    setRevealedCriteria((current) => (current === next ? current : next));
  });

  return (
    <section
      id="qualification"
      ref={sectionRef}
      className="landing-scene landing-light-scene landing-pin-qualification relative overflow-clip bg-[var(--lab-bone)] text-[var(--lab-ink)] lg:min-h-[165vh]"
    >
      <div aria-hidden="true" className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[rgba(169,101,80,.09)] blur-3xl" />

      <div className="landing-pinned-stage container relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 md:py-28 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-8">
        <div className="grid w-full items-center gap-10 md:gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16 xl:gap-20">
          <div>
            <p className="font-research inline-flex rounded-full border border-[var(--lab-light-border)] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--lab-muted)]">
              Planned research capability
            </p>
            <h2 className="font-display mt-6 max-w-xl text-[clamp(2.55rem,5.3vw,4.25rem)] font-semibold leading-[1.01] tracking-[-0.045em]">
              <TypeLine duration={0.72} fromY={26}>Find the people</TypeLine>
              <TypeLine delay={0.08} duration={0.76} fromY={28}>who fit the question.</TypeLine>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">
              Good research starts with the right context. We&apos;re designing AI-assisted screening to structure study-relevant information before a participant enters a test.
            </p>
            <p className="mt-6 max-w-lg border-l border-[var(--lab-oxide)]/40 pl-4 text-sm leading-6 text-[#68686b]">
              AI can organize interview context and explicit study criteria. Researchers decide who belongs in the study.
            </p>
          </div>

          <div className="relative lg:h-[72vh] lg:min-h-[560px] lg:max-h-[680px]">
            <motion.div
              style={reduceMotion ? undefined : { scale: imageScale }}
              className="relative overflow-hidden rounded-[2rem] border border-[var(--lab-light-border)] bg-[#ddd5c9] shadow-[0_30px_80px_rgba(37,31,24,.14)]"
            >
              <EditorialImage
                src="/home_image/ai_qualification_interview_001.webp"
                alt="A participant speaking with a researcher during a structured usability research interview."
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
                className="aspect-[3/2] rounded-[2rem]"
                objectPosition="50% 50%"
                overlay={false}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-white/6" />
              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 font-research text-[8px] uppercase tracking-[0.14em] text-white/78 backdrop-blur-md">
                Research interview / live context
              </div>
            </motion.div>

            <motion.div
              style={reduceMotion ? undefined : { y: panelY, opacity: panelOpacity }}
              className="relative -mt-16 ml-auto w-[94%] max-w-xl overflow-hidden rounded-[1.4rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.96)] shadow-[0_28px_70px_rgba(34,29,23,.16)] backdrop-blur-xl md:-mt-24 md:mr-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--lab-light-border)] px-5 py-4">
                <div>
                  <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[var(--lab-oxide)]">Research interview</p>
                  <p className="mt-1 text-sm font-semibold">Question 03 / 05</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#656569]">
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    {!reduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ opacity: [0.18, 0.48, 0.18], scale: [0.82, 1.2, 0.82] }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full bg-[rgba(169,101,80,.16)]"
                      />
                    )}
                    <Mic2 className="relative h-3.5 w-3.5 text-[var(--lab-oxide)]" />
                  </span>
                  Listening…
                </div>
              </div>

              <div className="p-5 md:p-6">
                <p className="max-w-lg text-lg font-medium leading-7 tracking-[-0.015em]">
                  “Tell us how you normally compare subscription plans before making a decision.”
                </p>

                <motion.p
                  style={reduceMotion ? undefined : { opacity: transcriptOpacity, y: transcriptY }}
                  className="mt-3 text-xs leading-5 text-[#727277]"
                >
                  Structured response context is captured for the study — not used to score the person.
                </motion.p>

                <div className="mt-5">
                  <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[#77777b]">Study context</p>
                  <div className="mt-3 divide-y divide-black/8 border-y border-black/8">
                    {criteria.map(([label, value], index) => {
                      const visible = reduceMotion || index < revealedCriteria;
                      return (
                        <motion.div
                          key={label}
                          animate={{
                            opacity: visible ? 1 : 0.2,
                            y: visible ? 0 : 8,
                            backgroundColor: visible ? 'rgba(127,137,120,.055)' : 'rgba(127,137,120,0)',
                          }}
                          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center justify-between gap-5 px-2 py-3"
                        >
                          <span className="text-sm text-[#55565a]">{label}</span>
                          <motion.span
                            animate={visible ? { scale: [0.96, 1.04, 1] } : { scale: 0.96 }}
                            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                            className="font-research inline-flex items-center gap-1.5 text-[9px] font-medium tracking-[0.1em] text-[var(--lab-sage)]"
                          >
                            <Check className="h-3 w-3" />
                            {value}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <p className="font-research mt-5 text-[9px] uppercase tracking-[0.12em] text-[#85858a]">
                  Context organized · Researcher review required
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
