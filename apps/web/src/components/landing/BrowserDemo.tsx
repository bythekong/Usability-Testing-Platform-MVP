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
import { ResearchLabel } from './ResearchLabel';

export function BrowserDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [completed, setCompleted] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const frameScale = useTransform(scrollYProgress, [0, 0.28, 0.82], [0.94, 1, 1]);
  const frameY = useTransform(scrollYProgress, [0, 0.32, 1], [40, 0, -20]);
  const panelX = useTransform(scrollYProgress, [0.12, 0.38, 1], [60, 0, 0]);
  const panelOpacity = useTransform(scrollYProgress, [0.1, 0.3, 1], [0, 1, 1]);
  const cursorX = useTransform(scrollYProgress, [0.22, 0.42, 0.56, 0.7], ['20%', '48%', '48%', '62%']);
  const cursorY = useTransform(scrollYProgress, [0.22, 0.42, 0.56, 0.7], ['72%', '46%', '46%', '58%']);
  const feedbackOpacity = useTransform(scrollYProgress, [0.48, 0.62], [0, 1]);
  const feedbackY = useTransform(scrollYProgress, [0.48, 0.62], [12, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = latest >= 0.72;
    setCompleted((current) => (current === next ? current : next));
  });

  return (
    <section id="in-context" ref={sectionRef} className="landing-scene landing-grain landing-pin-browser relative overflow-clip bg-[var(--lab-graphite)] text-[var(--lab-bone)] lg:min-h-[210vh]">
      <div className="landing-pinned-stage container relative mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-8">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <ResearchLabel index="06" label="IN CONTEXT" tone="dark" />
          <h2 className="font-display mt-5 text-[clamp(2.7rem,5.7vw,4.7rem)] font-semibold leading-[0.98] tracking-[-0.048em]">Keep the task<br /> beside the experience.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/56 md:text-lg md:leading-8">The tester works on the real target while instructions, progress, and feedback stay in context.</p>
        </div>

        <motion.div style={reduceMotion ? undefined : { scale: frameScale, y: frameY }} className="relative mx-auto w-full max-w-[1240px] rounded-[1.75rem] border border-white/10 bg-[var(--lab-carbon)] p-2 shadow-[0_45px_120px_rgba(0,0,0,.42)] md:p-3">
          <div className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#efeae1]">
            <div className="flex items-center gap-3 border-b border-black/10 bg-[#ddd7cd] px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#a96550]/80" /><span className="h-2.5 w-2.5 rounded-full bg-[#c9a15f]/80" /><span className="h-2.5 w-2.5 rounded-full bg-[#7f8978]/80" /></div>
              <div className="mx-auto flex h-8 w-[68%] max-w-xl items-center rounded-lg border border-black/10 bg-white/55 px-3 font-research text-[9px] text-black/45">https://acme-corp.com/pricing</div>
            </div>

            <div className="relative min-h-[510px] md:min-h-[600px] lg:h-[58vh] lg:min-h-[420px] lg:max-h-[620px]">
              <div className="absolute inset-3 md:inset-5 lg:inset-7">
                <EditorialImage src="/home_image/target_website_pricing_001.webp" alt="A fictional near-future product pricing and configuration website underneath the testing extension." sizes="(min-width: 1280px) 1180px, (min-width: 768px) 94vw, 100vw" className="h-full w-full rounded-[1rem]" imageClassName="object-cover" objectPosition="50% 50%" overlay={false} />
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1rem] ring-1 ring-inset ring-black/10 md:inset-5 lg:inset-7" />

              {!reduceMotion && (
                <motion.div aria-hidden="true" style={{ x: cursorX, y: cursorY }} className="pointer-events-none absolute left-0 top-0 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-[rgba(243,239,231,.86)] text-[var(--lab-graphite)] shadow-lg backdrop-blur md:flex"><MousePointer2 className="h-4 w-4" /></motion.div>
              )}

              <motion.aside aria-hidden="true" style={reduceMotion ? undefined : { x: panelX, opacity: panelOpacity }} className="absolute bottom-5 left-5 right-5 z-10 overflow-hidden rounded-[1.15rem] border border-white/10 bg-[rgba(11,13,18,.9)] text-[var(--lab-bone)] shadow-[0_28px_70px_rgba(0,0,0,.38)] backdrop-blur-xl md:bottom-auto md:left-auto md:right-8 md:top-8 md:w-[330px]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div><p className="font-research text-[8px] uppercase tracking-[0.15em] text-[var(--lab-amber)]">In-context task</p><p className="mt-1 text-sm font-semibold">Find the Pro plan</p></div>
                  <span className="font-research rounded-full border border-white/12 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-white/50">2 / 3</span>
                </div>
                <div className="p-4 md:p-5">
                  <p className="text-sm leading-6 text-white/62">Navigate the pricing page and choose the plan that best fits a small team.</p>
                  <motion.div style={reduceMotion ? undefined : { opacity: feedbackOpacity, y: feedbackY }} className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <p className="font-research text-[8px] uppercase tracking-[0.13em] text-white/35">Tester feedback</p>
                    <p className="mt-2 text-xs leading-5 text-white/58">The plans are easy to scan, but I expected support details closer to the plan name.</p>
                  </motion.div>
                  <div className={`mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-semibold transition-colors duration-300 ${completed ? 'bg-[var(--lab-sage)] text-white' : 'bg-[var(--lab-bone)] text-[var(--lab-graphite)]'}`}>
                    {completed ? <><Check className="h-4 w-4" /> Task completed</> : 'Complete task'}
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </motion.div>

        <div className="font-research mx-auto mt-7 flex w-full max-w-[1240px] items-center justify-between text-[8px] uppercase tracking-[0.14em] text-white/30">
          <span>Live target / contextual guidance</span><span>{completed ? 'Evidence returned' : 'Research in progress'}</span>
        </div>
      </div>
    </section>
  );
}
