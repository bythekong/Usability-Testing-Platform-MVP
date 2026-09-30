import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[var(--lab-graphite)] px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 text-[var(--lab-bone)] sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-9 md:flex-row md:items-start">
          <div>
            <p className="font-display text-lg font-semibold tracking-[-0.02em]">Future Test Lab 2030</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/42">A human-centered environment for observing digital behavior and building research evidence.</p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/48">
            <a href="#research-flow" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">Product</a>
            <a href="#evidence" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">Research</a>
            <Link href="/login" className="landing-nav-link transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none">Sign in</Link>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-white/8 pt-6 font-research sm:mt-10 text-[8px] uppercase tracking-[0.13em] text-white/28 sm:flex-row sm:items-center sm:justify-between">
          <span>AI assists. Humans experience. Researchers decide.</span>
          <span>© {new Date().getFullYear()} Usability Testing Platform</span>
        </div>
      </div>
    </footer>
  );
}
