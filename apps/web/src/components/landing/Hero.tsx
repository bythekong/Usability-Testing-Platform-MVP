'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, FlaskConical, UserRoundSearch } from 'lucide-react';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -44]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.88, 0.18]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden border-b border-border bg-slate-950 px-6 py-24 md:min-h-[860px] md:py-32"
    >
      <motion.div
        aria-hidden="true"
        style={reduceMotion ? undefined : { scale: videoScale, y: videoY }}
        className="absolute inset-0 -z-30"
      >
        <video
          className="h-full w-full object-cover"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src="/home_video/hero_background_001.webm" type="video/webm" />
        </video>
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.50),rgba(2,6,23,0.68)_55%,rgba(2,6,23,0.86)),radial-gradient(circle_at_50%_42%,rgba(15,23,42,0.08),rgba(2,6,23,0.36)_72%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-52 bg-gradient-to-b from-transparent to-background"
      />

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-5xl font-bold leading-[0.96] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[6.4rem]"
        >
          Watch real users use what you built.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-2xl text-balance text-base leading-7 text-white/72 sm:text-lg md:text-xl md:leading-8"
        >
          Create a study, send testers to your live site, and review the moments that need work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/login?role=OWNER"
            className="group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/34 bg-transparent px-6 text-sm font-semibold text-white backdrop-blur-[2px] transition-all hover:border-white/70 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Create a test
            <ArrowUpRight className="h-4 w-4 opacity-55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link
            href="/login?role=TESTER"
            className="group inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/34 bg-transparent px-6 text-sm font-semibold text-white backdrop-blur-[2px] transition-all hover:border-white/70 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <UserRoundSearch className="h-4 w-4" aria-hidden="true" />
            Start testing
            <ArrowUpRight className="h-4 w-4 opacity-55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.36 }}
          className="mt-4 text-xs font-medium tracking-wide text-white/45"
        >
          Owner setup · Tester workflow · Chrome Extension
        </motion.p>
      </motion.div>
    </section>
  );
}
