'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function ReviewStory() {
  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 md:order-1"
        >
          <div className="bg-background border border-border rounded-xl shadow-xl overflow-hidden max-w-lg mx-auto md:mx-0 relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">OWNER</span>
            </div>
            <div className="p-6 border-b border-border bg-surface">
              <h3 className="font-semibold text-lg">Tester Submission</h3>
              <p className="text-sm text-muted">tester_492 • Checkout Flow Test</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Task 1: Find pricing</h4>
                <div className="p-3 bg-surface border border-border rounded-md text-sm text-muted">
                  &quot;It was easy to find in the top navigation, but the differences between plans were a bit confusing.&quot;
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Task 2: Select Pro plan</h4>
                <div className="p-3 bg-surface border border-border rounded-md text-sm text-muted">
                  &quot;Clicked the button, but it took a few seconds to load the checkout page.&quot;
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface border-t border-border flex gap-3 justify-end items-center">
              <span className="text-sm text-muted mr-auto px-2">Status: <strong className="text-warning-text font-medium bg-warning-bg px-2 py-0.5 rounded ml-1">Submitted</strong></span>
              <Button variant="danger" size="sm" className="bg-danger/10 text-danger hover:bg-danger/20 border-0 shadow-none">Reject</Button>
              <Button size="sm" className="bg-success-text text-white hover:bg-success-text/90">Approve</Button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 md:order-2"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">Actionable insights, instantly.</h2>
          <p className="text-lg text-muted mb-6">
            Review completed tests right from your dashboard. Read feedback, see where testers struggled, and approve or reject submissions to finalize the loop.
          </p>
          <ul className="space-y-3 text-muted">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Task-by-task feedback breakdown
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              One-click approval workflow
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Close the feedback loop quickly
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
