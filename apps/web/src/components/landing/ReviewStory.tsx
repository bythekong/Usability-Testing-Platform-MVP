'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EditorialImage } from './EditorialImage';
import { TypeLine } from './TypeLine';

const evidence = [
  ['TASK 01', '“Plan differences needed a second read.”'],
  ['TRACE', 'Returned to comparison twice.'],
  ['TASK 02', '“Expected support details earlier.”'],
];

export function ReviewStory() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="evidence" className="landing-scene relative overflow-hidden bg-[var(--lab-stone)] py-24 text-[var(--lab-ink)] md:py-32 lg:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <EditorialImage src="/home_image/owner_review_feedback_001.webp" alt="A product researcher reviewing participant feedback and interaction evidence in a contemporary research studio." sizes="(min-width: 1024px) 54vw, 100vw" className="aspect-[3/2] rounded-[2rem] shadow-[0_32px_90px_rgba(31,27,22,.18)]" objectPosition="50% 50%" />

            <div className="relative -mt-14 ml-auto w-[94%] max-w-xl md:-mt-24 md:mr-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {evidence.map(([label, copy], index) => (
                  <motion.div key={label + copy} initial={reduceMotion ? false : { opacity: 0, y: 24, x: index % 2 ? 10 : -10 }} whileInView={{ opacity: 1, y: 0, x: 0 }} viewport={{ once: false, amount: 0.55 }} transition={{ delay: index * 0.08, duration: 0.62, ease: [0.22, 1, 0.36, 1] }} className="landing-evidence-card rounded-[1.05rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.95)] p-4 shadow-[0_18px_48px_rgba(37,31,24,.10)] backdrop-blur-lg">
                    <p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-oxide)]">{label}</p><p className="mt-2 text-sm leading-6 text-[#535459]">{copy}</p>
                  </motion.div>
                ))}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  viewport={{ once: false, amount: 0.55 }}
                  transition={{ delay: 0.24, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[1.05rem] border border-[rgba(127,137,120,.35)] bg-[rgba(127,137,120,.12)] p-4"
                >
                  {!reduceMotion && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ x: '-130%' }}
                      whileInView={{ x: '130%' }}
                      viewport={{ once: false, amount: 0.7 }}
                      transition={{ duration: 1.1, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/22 to-transparent"
                    />
                  )}
                  <p className="font-research relative text-[8px] uppercase tracking-[0.15em] text-[var(--lab-sage)]">Surfaced pattern</p>
                  <p className="font-editorial relative mt-2 text-[1.12rem] font-medium italic leading-6 text-[#45484a]">Plan comparison requires repeated scanning.</p>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-editorial text-[clamp(3.15rem,5.55vw,5rem)] font-medium leading-[0.92] tracking-[-0.04em]">
              <TypeLine duration={0.82} fromX={-10} fromY={24}>What happened</TypeLine>
              <TypeLine delay={0.18} duration={0.9} fromX={12} fromY={26} className="italic font-medium text-[rgba(24,25,28,.88)]">becomes evidence.</TypeLine>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">Responses stay connected to the tasks and context that produced them. AI can help organize the material. Researchers interpret what it means.</p>
            <div className="mt-8 border-l border-[var(--lab-sage)]/45 pl-4"><p className="font-research text-[9px] uppercase tracking-[0.14em] text-[#77787c]">Research principle</p><p className="mt-2 text-sm font-medium text-[#515257]">Researchers interpret what it means.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
