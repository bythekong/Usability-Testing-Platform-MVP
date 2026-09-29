'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold text-xl tracking-tight text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              U
            </div>
            Usability Platform
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#owner" className="hover:text-foreground transition-colors">For Teams</a>
            <a href="#tester" className="hover:text-foreground transition-colors">For Testers</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
