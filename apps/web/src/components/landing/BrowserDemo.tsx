'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function BrowserDemo() {
  return (
    <section className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            The Chrome Extension Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted max-w-2xl mx-auto"
          >
            Testing happens directly on your target website. Our extension overlays the tasks contextually, ensuring testers interact with the real product.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main Browser Mockup */}
          <div className="rounded-xl border border-border bg-surface shadow-2xl overflow-hidden relative min-h-[600px]">
            {/* Browser Header */}
            <div className="bg-border/20 px-4 py-3 border-b border-border flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-danger"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-warning-text"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-success-text"></div>
              </div>
              <div className="flex-1 bg-background/50 border border-border h-8 rounded-md flex items-center px-4 text-sm text-muted max-w-xl mx-auto">
                https://acme-corp.com/pricing
              </div>
            </div>

            {/* Fake Website Content */}
            <div className="p-12 h-full bg-background/30">
              <div className="max-w-3xl mx-auto">
                <div className="h-8 w-48 bg-border/50 rounded mb-8"></div>
                <div className="h-16 w-3/4 bg-border/50 rounded mb-16"></div>
                
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 border border-border bg-surface rounded-xl p-6">
                      <div className="h-6 w-24 bg-border/50 rounded mb-4"></div>
                      <div className="h-12 w-full bg-border/30 rounded mb-8"></div>
                      <div className="space-y-3 mb-8">
                        <div className="h-3 w-full bg-border/20 rounded"></div>
                        <div className="h-3 w-full bg-border/20 rounded"></div>
                        <div className="h-3 w-4/5 bg-border/20 rounded"></div>
                      </div>
                      <div className={`h-10 w-full rounded ${i === 2 ? 'bg-primary' : 'bg-border/50'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Extension Overlay */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              className="absolute top-20 right-8 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-primary px-4 py-3 text-white flex justify-between items-center">
                <span className="font-medium text-sm">Testing Platform</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">2 / 3</span>
              </div>
              
              <div className="p-5 flex-1">
                <h4 className="font-semibold mb-2 text-sm">Task 2: Find the Pro Plan</h4>
                <p className="text-sm text-muted mb-6">
                  Navigate to the pricing page and select the Pro plan that best fits the needs of a small team.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">Your Feedback</label>
                    <textarea 
                      className="w-full bg-background border border-border rounded-md p-3 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Did you encounter any issues finding the plan?"
                      defaultValue="The pricing link was easy to find, but I wasn't sure if the Pro plan included priority support."
                    ></textarea>
                  </div>
                </div>

                <Button className="w-full">
                  Complete Task
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
