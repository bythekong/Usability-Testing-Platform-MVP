'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <section className="py-32 bg-surface relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
        >
          Start testing the experience your users actually see.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted mb-10"
        >
          Connect real users with your product in minutes. Stop guessing and start validating.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Link href="/login">
            <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg" className="h-14 px-10 text-base rounded-full">
              Log in to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
