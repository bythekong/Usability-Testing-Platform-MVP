'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check, Mic2, Video } from 'lucide-react';
import { ResearchLabel } from './ResearchLabel';

const criteria = [
  ['Mobile banking experience', 'MATCH'],
  ['Android user', 'MATCH'],
  ['Think-aloud preference', 'AVAILABLE'],
  ['Previous product usage', 'NONE'],
];

export function QualificationStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const mediaY = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -20]);
  const panelY = useTransform(scrollYProgress, [0.18, 0.55, 0.88], [54, 0, -24]);
  const panelOpacity = useTransform(scrollYProgress, [0.12, 0.34, 0.92], [0.4, 1, 0.86]);

  return (
    <section id="qualification" ref={sectionRef} className="landing-scene relative overflow-hidden bg-[var(--lab-bone)] py-24 text-[var(--lab-ink)] md:py-32 lg:py-36">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[rgba(169,101,80,.09)] blur-3xl" />
      <div className="container relative mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <ResearchLabel index="02" label="QUALIFICATION" />
            <p className="font-research mt-5 inline-flex rounded-full border border-[var(--lab-light-border)] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--lab-muted)]">Planned research capability</p>
            <h2 className="font-display mt-6 max-w-xl text-[clamp(2.55rem,5.3vw,4.25rem)] font-semibold leading-[1.01] tracking-[-0.045em]">Find the people<br /> who fit the question.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5f6064] md:text-lg md:leading-8">Good research starts with the right context. We&apos;re designing AI-assisted screening to structure study-relevant information before a participant enters a test.</p>
            <p className="mt-6 max-w-lg border-l border-[var(--lab-oxide)]/40 pl-4 text-sm leading-6 text-[#68686b]">AI can organize interview context and explicit study criteria. Researchers decide who belongs in the study.</p>
          </div>

          <div className="relative min-h-[720px] lg:min-h-[820px]">
            <motion.div style={reduceMotion ? undefined : { y: mediaY }} className="relative overflow-hidden rounded-[2rem] border border-[var(--lab-light-border)] bg-[#ddd5c9] shadow-[0_30px_80px_rgba(37,31,24,.14)]">
              <div role="img" aria-label="Reserved media space for a future editorial photograph of a participant in an AI-assisted research interview." className="relative aspect-[3/2] overflow-hidden bg-[linear-gradient(135deg,#d8d0c4,#eee9df_58%,#d5cec1)]">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_30%_32%,rgba(169,101,80,.16),transparent_24%),linear-gradient(115deg,transparent_35%,rgba(255,255,255,.48)_35.5%,transparent_36%)]" />
                <div aria-hidden="true" className="absolute left-[14%] top-[17%] h-[58%] w-[42%] rounded-[45%_45%_26%_26%] bg-[#aaa296]/50 blur-[1px]" />
                <div aria-hidden="true" className="absolute bottom-[8%] left-[7%] right-[7%] h-[20%] rounded-[1.5rem] border border-black/10 bg-white/24 backdrop-blur-md" />
                <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
                  <div><p className="font-research text-[9px] uppercase tracking-[0.16em] text-black/45">Media reserved</p><p className="mt-1 max-w-sm text-sm font-medium text-black/70">Participant interview in a quiet near-future research environment.</p></div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/55 text-black/60 backdrop-blur"><Video className="h-4 w-4" aria-hidden="true" /></div>
                </div>
                <code className="absolute left-7 top-7 rounded-full border border-black/10 bg-white/45 px-3 py-1.5 text-[9px] text-black/50 backdrop-blur">/home_image/ai_qualification_interview_001.webp</code>
              </div>
            </motion.div>

            <motion.div style={reduceMotion ? undefined : { y: panelY, opacity: panelOpacity }} className="relative -mt-20 ml-auto w-[94%] max-w-xl overflow-hidden rounded-[1.4rem] border border-[var(--lab-light-border)] bg-[rgba(243,239,231,.94)] shadow-[0_28px_70px_rgba(34,29,23,.16)] backdrop-blur-xl md:-mt-32 md:mr-6">
              <div className="flex items-center justify-between border-b border-[var(--lab-light-border)] px-5 py-4">
                <div><p className="font-research text-[9px] uppercase tracking-[0.16em] text-[var(--lab-oxide)]">Research interview</p><p className="mt-1 text-sm font-semibold">Question 03 / 05</p></div>
                <div className="flex items-center gap-2 text-[10px] text-[#656569]"><Mic2 className="h-3.5 w-3.5 text-[var(--lab-oxide)]" /> Listening…</div>
              </div>
              <div className="p-5 md:p-6">
                <p className="max-w-lg text-lg font-medium leading-7 tracking-[-0.015em]">“Tell us how you normally compare subscription plans before making a decision.”</p>
                <div className="mt-6">
                  <p className="font-research text-[9px] uppercase tracking-[0.16em] text-[#77777b]">Study context</p>
                  <div className="mt-3 divide-y divide-black/8 border-y border-black/8">
                    {criteria.map(([label, value], index) => (
                      <motion.div key={label} initial={reduceMotion ? false : { opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.7 }} transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-between gap-5 py-3">
                        <span className="text-sm text-[#55565a]">{label}</span><span className="font-research inline-flex items-center gap-1.5 text-[9px] font-medium tracking-[0.1em] text-[var(--lab-sage)]"><Check className="h-3 w-3" /> {value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <p className="font-research mt-5 text-[9px] uppercase tracking-[0.12em] text-[#85858a]">Context organized · Researcher review required</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
