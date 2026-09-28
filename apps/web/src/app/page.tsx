import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-foreground">
          Usability Testing Platform
        </h1>
        <p className="text-xl text-muted mt-6 max-w-2xl mx-auto">
          The all-in-one platform for testing and validating your user experiences.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-8">
          <Link href="/login">
            <Button size="lg" className="px-8 text-base h-12 rounded-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
