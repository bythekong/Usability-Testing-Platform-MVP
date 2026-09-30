'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { EditorialImage } from './EditorialImage';
import { TypeLine } from './TypeLine';

export function TesterStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 0.5, 1], [26, 0, -22]);
  const cursorX = useTransform(scrollYProgress, [0.12, 0.34, 0.5, 0.68, 0.9], ['18%', '36%', '36%', '54%', '62%']);
  const cursorY = useTransform(scrollYProgress, [0.12, 0.34, 0.5, 0.68, 0.9], ['62%', '52%', '52%', '44%', '48%']);

  return (
    <section id="observation" ref={sectionRef} className="landing-scene relative overflow-hidden bg-[var(--lab-bone)] py-24 text-[var(--lab-ink)] md:py-32 lg:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-20">
          <div>
            <h2 className="font-editorial max-w-[6.6ch] text-[clamp(3.5rem,6.25vw,5.8rem)] font-medium leading-[0.9] tracking-[-0.045em]">
              <TypeLine duration={0.82} fromY={28}>The moment before</TypeLine>
              <TypeLine delay={0.28} duration={0.9} fromY={30} className="italic font-medium text-[rgba(24,25,28,.9)]">the click matters.</TypeLine>
            </h2>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">People do not experience interfaces as funnels or metrics. They search, hesitate, misunderstand, recover, and decide.</p>
            <div className="mt-9 max-w-md border-t border-black/10 pt-5"><p className="font-research text-[9px] uppercase tracking-[0.14em] text-[#77787c]">Observed moment</p><p className="mt-2 text-sm leading-6 text-[#626367]">The pause is part of the evidence. The interface does not need to explain it away.</p></div>
          </div>

          <div className="relative">
            <motion.div style={reduceMotion ? undefined : { y: imageY }}>
              <EditorialImage src="/home_image/tester_browser_session_001.webp" alt="A usability tester pausing while working through a task on a live digital product." sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-[4/3] rounded-[2rem] shadow-[0_32px_90px_rgba(31,27,22,.2)]" objectPosition="50% 50%" />
            </motion.div>

            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-5 left-5 max-w-[280px] rounded-[1.15rem] border border-white/16 bg-[rgba(11,13,18,.78)] p-4 text-[var(--lab-bone)] shadow-2xl backdrop-blur-xl md:bottom-8 md:left-8">
              <div className="flex items-center justify-between gap-5">
                <p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-amber)]">Task 02 / 03</p>
                <span className="font-research inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.13em] text-white/38">
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--lab-sage)]">
                    {!reduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 2, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full bg-[var(--lab-sage)]"
                      />
                    )}
                  </span>
                  Session active
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6">Find the plan you would choose.</p>
              <div className="mt-3 flex items-center gap-2">
                <p className="font-research text-[8px] uppercase tracking-[0.12em] text-white/42">Thinking aloud…</p>
                {!reduceMotion && (
                  <span aria-hidden="true" className="flex items-end gap-[2px]">
                    {[0, 1, 2].map((index) => (
                      <motion.span
                        key={index}
                        animate={{ height: [3, 9 - index * 2, 3] }}
                        transition={{ duration: 1.05, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }}
                        className="block w-[2px] rounded-full bg-[var(--lab-amber)]/65"
                      />
                    ))}
                  </span>
                )}
              </div>
            </motion.div>

            {!reduceMotion && (
              <motion.div aria-hidden="true" style={{ x: cursorX, y: cursorY }} className="pointer-events-none absolute left-0 top-0 hidden h-9 w-9 items-center justify-center rounded-full border border-white/24 bg-[rgba(243,239,231,.82)] text-[var(--lab-graphite)] shadow-lg backdrop-blur md:flex"><MousePointer2 className="h-4 w-4" /></motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
