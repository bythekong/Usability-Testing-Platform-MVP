'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            See where users struggle. <br/>
            <span className="text-muted/60">Before you ship.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-muted leading-relaxed"
          >
            Create usability tests, let real people complete tasks directly on your website, and review actionable feedback without leaving your dashboard.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20">
                Start Testing Now
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full">
                See How It Works
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Animated UI composition */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative h-[500px] w-full hidden lg:block perspective-1000"
        >
          {/* Campaign Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-20 w-80 bg-surface border border-border rounded-xl shadow-2xl p-6 z-10"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Checkout Flow Test</h3>
                <p className="text-sm text-muted">example.com</p>
              </div>
              <span className="bg-success-bg text-success-text text-xs px-2 py-1 rounded-full font-medium">Active</span>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3 text-sm text-muted">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>3 Tasks defined</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <Users className="w-4 h-4 text-primary" />
                <span>5 Testers recruited</span>
              </div>
            </div>
          </motion.div>

          {/* Browser Overlay mockup */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-10 w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-20"
          >
            <div className="bg-border/30 px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <div className="w-3 h-3 rounded-full bg-warning-text"></div>
              <div className="w-3 h-3 rounded-full bg-success-text"></div>
              <div className="flex-1 bg-surface ml-4 h-6 rounded text-xs flex items-center px-2 text-muted truncate">
                example.com/pricing
              </div>
            </div>
            <div className="p-6 relative">
              <div className="absolute right-4 top-4 w-64 bg-background border border-border rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Task 2 of 3</span>
                  <span className="text-xs text-muted">01:42</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-4">
                  Find the pro pricing plan and proceed to checkout.
                </p>
                <Button size="sm" className="w-full">Complete Task</Button>
              </div>
              <div className="space-y-4 opacity-50 blur-[1px]">
                <div className="h-8 bg-border rounded w-3/4"></div>
                <div className="h-4 bg-border rounded w-full"></div>
                <div className="h-4 bg-border rounded w-5/6"></div>
                <div className="h-32 bg-border rounded w-full mt-8"></div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
