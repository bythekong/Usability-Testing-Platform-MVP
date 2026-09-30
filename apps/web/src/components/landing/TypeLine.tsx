'use client';

import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type TypeLineProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  fromX?: number;
  fromY?: number;
  amount?: number;
}>;

export function TypeLine({
  children,
  className = '',
  delay = 0,
  duration = 0.78,
  fromX = 0,
  fromY = 34,
  amount = 0.7,
}: TypeLineProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span
        initial={reduceMotion ? false : { opacity: 0, x: fromX, y: fromY }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`block will-change-transform ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}
