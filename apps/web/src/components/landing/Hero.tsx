'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.82, 0.15]);

  return (
    <section
      id="lab"
      ref={sectionRef}
      className="landing-scene landing-grain relative isolate flex min-h-[94svh] items-center overflow-hidden bg-[var(--lab-graphite)] px-6 pb-20 pt-28 text-[var(--lab-bone)] md:min-h-[900px] md:pb-28 md:pt-32"
    >
      <motion.div
        aria-hidden="true"
        style={reduceMotion ? undefined : { scale: videoScale, y: videoY }}
        className="absolute inset-0 -z-30"
      >
        <video className="h-full w-full object-cover" autoPlay={!reduceMotion} muted loop playsInline preload="metadata" tabIndex={-1}>
          <source src="/home_video/hero_background_001.webm" type="video/webm" />
        </video>
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(6,8,12,.48),rgba(6,8,12,.48)_42%,rgba(6,8,12,.78)_78%,#0b0d12_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_55%_34%,rgba(201,161,95,.10),transparent_31%)]" />

      <motion.div style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <h1 className="font-display max-w-5xl text-balance text-[clamp(3.15rem,8vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--lab-bone)]">
          <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.06, ease }}
              className="block"
            >
              Watch real users
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.92, delay: 0.15, ease }}
              className="block"
            >
              use what you built.
            </motion.span>
          </span>
        </h1>
        <motion.p initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.72, delay: 0.17, ease }} className="mt-7 max-w-2xl text-balance text-base leading-7 text-[rgba(243,239,231,.72)] sm:text-lg md:text-xl md:leading-8">
          Find the right participants, send them into the live product, and observe the moments that reveal what needs work.
        </motion.p>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.72, delay: 0.27, ease }} className="mt-9 flex w-full max-w-lg flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login?role=OWNER" className="group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--lab-bone)] px-6 text-sm font-semibold text-[var(--lab-graphite)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-bone)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-graphite)]">
            Create a study
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/login?role=TESTER" className="group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-black/10 px-6 text-sm font-semibold text-[var(--lab-bone)] backdrop-blur-sm transition-colors hover:border-white/55 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-bone)]">
            Explore as a tester
            <ArrowUpRight className="h-4 w-4 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </motion.div>
        <motion.p initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="font-research mt-5 text-[10px] uppercase tracking-[0.13em] text-white/42">
          AI assists. Humans experience. Researchers decide.
        </motion.p>
      </motion.div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[var(--lab-bone)] opacity-0 sm:opacity-100" />
    </section>
  );
}
