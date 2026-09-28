import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { WorkflowStory } from '@/components/landing/WorkflowStory';
import { OwnerStory } from '@/components/landing/OwnerStory';
import { TesterStory } from '@/components/landing/TesterStory';
import { BrowserDemo } from '@/components/landing/BrowserDemo';
import { ReviewStory } from '@/components/landing/ReviewStory';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <WorkflowStory />
        <OwnerStory />
        <TesterStory />
        <BrowserDemo />
        <ReviewStory />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
