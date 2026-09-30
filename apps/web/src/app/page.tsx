import type { Metadata } from 'next';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { QualificationStory } from '@/components/landing/QualificationStory';
import { OwnerStory } from '@/components/landing/OwnerStory';
import { WorkflowStory } from '@/components/landing/WorkflowStory';
import { TesterStory } from '@/components/landing/TesterStory';
import { BrowserDemo } from '@/components/landing/BrowserDemo';
import { ReviewStory } from '@/components/landing/ReviewStory';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Usability Testing Platform — Observe Real User Behavior',
  description:
    'Build usability studies, match the right participants, observe real behavior in live products, and turn what happened into research evidence.',
};

export default function LandingPage() {
  return (
    <div className="landing-lab flex min-h-screen flex-col bg-[var(--lab-graphite)] text-[var(--lab-bone)]">
      <a href="#landing-main" className="landing-skip-link">
        Skip to content
      </a>
      <Header />
      <main id="landing-main" className="flex-1" tabIndex={-1}>
        <Hero />
        <QualificationStory />
        <OwnerStory />
        <WorkflowStory />
        <TesterStory />
        <BrowserDemo />
        <ReviewStory />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
