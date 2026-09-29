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
      <div className="container mx-auto grid h-16 grid-cols-[1fr_auto] items-center gap-4 px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 justify-self-start text-xl font-semibold tracking-tight text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white">
            U
          </div>
          <span className="hidden sm:inline">Usability Platform</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex md:justify-self-center">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#owner" className="transition-colors hover:text-foreground">For Owners</a>
          <a href="#tester" className="transition-colors hover:text-foreground">For Testers</a>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Link href="/login">
            <Button variant="ghost" className="px-3 sm:px-4">
              Log in
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
