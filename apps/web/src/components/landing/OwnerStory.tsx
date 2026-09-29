'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ListChecks, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ScrollReveal } from './ScrollReveal';

export function OwnerStory() {
  return (
    <section id="owner" className="relative overflow-hidden bg-background py-28 md:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <ScrollReveal direction="left">
              <ImagePlaceholder
                title="Owner photography — product team preparing a usability study"
                description="Editorial image of a small product team reviewing a website on a large screen or laptop. Human collaboration, warm natural lighting, believable workspace, no staged stock-photo handshake."
                aspectRatio="4 / 3"
                dimensions="1400 × 1050"
                filePath="apps/web/public/home_image/owner_campaign_setup_001.webp"
                className="shadow-[0_36px_90px_rgba(15,23,42,0.2)]"
              />
            </ScrollReveal>

            <motion.div initial={{ opacity: 0, y: 46, rotate: -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="relative -mt-20 ml-auto w-[92%] max-w-xl rounded-2xl border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur md:-mt-28 md:mr-6">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Owner</p><h3 className="mt-1 font-semibold text-foreground">Create Campaign</h3></div><ArrowUpRight className="h-5 w-5 text-muted" /></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-3"><div className="flex items-center gap-2 text-xs font-medium text-muted"><Link2 className="h-4 w-4 text-primary" /> Target URL</div><p className="mt-2 truncate text-sm text-foreground">https://yourproduct.com</p></div>
                <div className="rounded-xl border border-border bg-background p-3"><div className="flex items-center gap-2 text-xs font-medium text-muted"><ListChecks className="h-4 w-4 text-primary" /> Tasks</div><p className="mt-2 text-sm text-foreground">3 tasks defined</p></div>
              </div>
              <Button className="mt-4 w-full">Launch Campaign</Button>
            </motion.div>
          </div>

          <ScrollReveal direction="right" className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">For owners</p>
            <h2 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">Turn a research question into a live test in minutes.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Paste the website you want tested, write the tasks, launch the campaign, and keep the study connected to the same workflow your team already reviews.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {['Real target URL', 'Clear task sequence', 'No SDK required'].map((item, index) => (
                <motion.div key={item} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.7 }} transition={{ delay: index * 0.07 }} className="rounded-2xl border border-border bg-surface p-4 text-sm font-medium text-foreground shadow-sm">{item}</motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
