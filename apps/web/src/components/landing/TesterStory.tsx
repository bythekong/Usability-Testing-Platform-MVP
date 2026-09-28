'use client';

import { motion } from 'framer-motion';

export function TesterStory() {
  return (
    <section id="tester" className="py-24 bg-background overflow-hidden border-y border-border">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">A frictionless experience for Testers.</h2>
          <p className="text-lg text-muted mb-6">
            Testers browse available jobs, claim one, and jump straight into testing using our Chrome Extension. 
            Everything happens on the real website, exactly how users experience it.
          </p>
          <ul className="space-y-3 text-muted">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Claim jobs instantly
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Test directly in the browser
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Submit contextual feedback
            </li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-surface border border-border rounded-xl shadow-xl p-8 max-w-md mx-auto md:ml-auto relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-orange-500/10 text-orange-600 text-xs font-semibold px-2 py-1 rounded">TESTER</span>
            </div>
            <h3 className="text-xl font-bold mb-6">Available Jobs</h3>
            <div className="space-y-4">
              <div className="p-4 bg-background border border-border rounded-lg flex justify-between items-center group hover:border-primary transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold text-sm">Checkout Flow Test</h4>
                  <p className="text-xs text-muted mt-1">example.com • 3 tasks</p>
                </div>
                <div className="px-3 py-1.5 bg-primary text-white text-xs rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Claim
                </div>
              </div>
              <div className="p-4 bg-background border border-border rounded-lg flex justify-between items-center opacity-50">
                <div>
                  <h4 className="font-semibold text-sm">Onboarding Review</h4>
                  <p className="text-xs text-muted mt-1">acme.com • 5 tasks</p>
                </div>
                <div className="text-xs font-medium text-muted">Claimed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
