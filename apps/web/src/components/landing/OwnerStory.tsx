'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { EditorialImage } from './EditorialImage';
import { TypeLine } from './TypeLine';

const fragments = [
  { label: 'TARGET', value: 'yourproduct.com', className: 'left-2 top-10 md:-left-5 md:top-16' },
  { label: 'PARTICIPANTS', value: '6 matched', className: 'right-3 top-12 md:-right-6 md:top-24' },
  { label: 'TASK 01', value: 'Compare plans', className: 'left-4 bottom-24 md:-left-7 md:bottom-28' },
];

export function OwnerStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 0.5, 1], [28, 0, -24]);
  const panelY = useTransform(scrollYProgress, [0.15, 0.55, 0.9], [58, 0, -28]);

  return (
    <section id="study" ref={sectionRef} className="landing-scene relative overflow-hidden bg-[var(--lab-stone)] py-24 text-[var(--lab-ink)] md:py-32 lg:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.18fr_0.82fr] lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <motion.div style={reduceMotion ? undefined : { y: imageY }}>
              <EditorialImage src="/home_image/owner_campaign_setup_001.webp" alt="A product research team preparing a usability study inside a contemporary interaction lab." sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[4/3] rounded-[2rem] shadow-[0_30px_85px_rgba(33,29,24,.18)]" objectPosition="50% 50%" />
            </motion.div>

            {fragments.map((fragment, index) => (
              <motion.div key={fragment.label} initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.45 }} transition={{ delay: 0.08 + index * 0.08, duration: 0.58, ease: [0.22, 1, 0.36, 1] }} className={`absolute hidden rounded-xl border border-white/28 bg-[rgba(11,13,18,.72)] px-3 py-2 text-[var(--lab-bone)] shadow-xl backdrop-blur-lg md:block ${fragment.className}`}>
                <p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-amber)]">{fragment.label}</p>
                <p className="mt-1 text-xs font-medium">{fragment.value}</p>
              </motion.div>
            ))}

            <motion.div style={reduceMotion ? undefined : { y: panelY }} className="relative -mt-16 ml-auto w-[94%] max-w-lg overflow-hidden rounded-[1.35rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.95)] shadow-[0_30px_80px_rgba(31,27,21,.17)] backdrop-blur-xl md:-mt-28 md:mr-7">
              <div className="border-b border-[var(--lab-light-border)] px-5 py-4">
                <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[var(--lab-oxide)]">Study setup</p>
                <p className="mt-1 text-sm font-semibold">Checkout decision study</p>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-[0.8fr_1.2fr] md:p-6">
                <div className="space-y-4">
                  <div><p className="font-research text-[8px] uppercase tracking-[0.14em] text-[#79797d]">Target</p><p className="mt-1 text-sm font-medium">yourproduct.com</p></div>
                  <div><p className="font-research text-[8px] uppercase tracking-[0.14em] text-[#79797d]">Participants</p><p className="mt-1 text-sm font-medium">6 matched</p></div>
                </div>
                <div>
                  <p className="font-research text-[8px] uppercase tracking-[0.14em] text-[#79797d]">Tasks</p>
                  <div className="mt-2 space-y-2">
                    {['Compare plans', 'Start checkout', 'Find support'].map((task, index) => (
                      <div key={task} className="flex items-center gap-2 border-b border-black/7 pb-2 text-sm">
                        <span className="font-research text-[9px] text-[var(--lab-oxide)]">0{index + 1}</span><span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--lab-light-border)] px-5 py-4">
                <span className="font-research text-[9px] uppercase tracking-[0.11em] text-[#747478]">Ready to launch</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--lab-graphite)] px-4 py-2 text-xs font-semibold text-[var(--lab-bone)]"><CheckCircle2 className="h-3.5 w-3.5" /> Launch study</span>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-display text-[clamp(2.55rem,5vw,4.15rem)] font-semibold leading-[1.01] tracking-[-0.045em]">
              <TypeLine duration={0.72} fromX={-12} fromY={20}>Turn a question</TypeLine>
              <TypeLine delay={0.16} duration={0.8} fromX={16} fromY={22} className="text-[rgba(24,25,28,.82)]">into an experiment.</TypeLine>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#616267] md:text-lg md:leading-8">Define the real product, the tasks participants should complete, and the context that matters to the study.</p>
            <div className="mt-8 h-px w-24 bg-[var(--lab-oxide)]/35" />
            <p className="font-research mt-5 max-w-md text-[10px] uppercase leading-5 tracking-[0.11em] text-[#78797d]">Research question → participant context → task sequence → live study</p>
          </div>
        </div>
      </div>
    </section>
  );
}
