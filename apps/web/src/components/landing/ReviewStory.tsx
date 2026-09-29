'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EditorialImage } from './EditorialImage';
import { ResearchLabel } from './ResearchLabel';

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
                  <motion.div key={label + copy} initial={reduceMotion ? false : { opacity: 0, y: 24, x: index % 2 ? 10 : -10 }} whileInView={{ opacity: 1, y: 0, x: 0 }} viewport={{ once: false, amount: 0.55 }} transition={{ delay: index * 0.08, duration: 0.62, ease: [0.22, 1, 0.36, 1] }} className="rounded-[1.05rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.95)] p-4 shadow-[0_18px_48px_rgba(37,31,24,.10)] backdrop-blur-lg">
                    <p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-oxide)]">{label}</p><p className="mt-2 text-sm leading-6 text-[#535459]">{copy}</p>
                  </motion.div>
                ))}
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.55 }} transition={{ delay: 0.24, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="rounded-[1.05rem] border border-[rgba(127,137,120,.35)] bg-[rgba(127,137,120,.12)] p-4">
                  <p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-sage)]">Surfaced pattern</p><p className="mt-2 text-sm font-medium leading-6 text-[#45484a]">Plan comparison requires repeated scanning.</p>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <ResearchLabel index="07" label="EVIDENCE" />
            <h2 className="font-display mt-5 text-[clamp(2.65rem,5.1vw,4.15rem)] font-semibold leading-[1] tracking-[-0.045em]">What happened<br /> becomes evidence.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">Responses stay connected to the tasks and context that produced them. AI can help organize the material. Researchers interpret what it means.</p>
            <div className="mt-8 border-l border-[var(--lab-sage)]/45 pl-4"><p className="font-research text-[9px] uppercase tracking-[0.14em] text-[#77787c]">Research principle</p><p className="mt-2 text-sm font-medium text-[#515257]">Researchers interpret what it means.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
