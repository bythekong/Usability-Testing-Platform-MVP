'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function OwnerStory() {
  return (
    <section id="owner" className="py-24 bg-surface overflow-hidden">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 md:order-1"
        >
          <div className="bg-background border border-border rounded-xl shadow-xl p-8 max-w-md mx-auto md:mx-0 relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">OWNER</span>
            </div>
            <h3 className="text-xl font-bold mb-6">Create Campaign</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Target URL</label>
                <div className="h-10 bg-surface border border-border rounded-md px-3 flex items-center text-sm">
                  https://yourproduct.com
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-muted">Tasks</label>
                <div className="p-3 bg-surface border border-border rounded-md text-sm mb-2">
                  1. Find the onboarding flow
                </div>
                <div className="p-3 bg-surface border border-border rounded-md text-sm">
                  2. Complete user profile
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full">Launch Campaign</Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 md:order-2"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">Set up in minutes.</h2>
          <p className="text-lg text-muted mb-6">
            Owners can create a campaign by simply pasting a target website URL and defining clear tasks. No SDKs, no complex integrations.
          </p>
          <ul className="space-y-3 text-muted">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Define specific URLs
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Write clear, step-by-step tasks
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              Manage tester recruiting
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
