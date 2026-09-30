import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[var(--lab-graphite)] px-6 py-12 text-[var(--lab-bone)]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-9 md:flex-row md:items-start">
          <div>
            <p className="font-display text-lg font-semibold tracking-[-0.02em]">Future Test Lab 2030</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/42">A human-centered environment for observing digital behavior and building research evidence.</p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/48">
            <a href="#research-flow" className="transition-colors hover:text-white">Product</a>
            <a href="#evidence" className="transition-colors hover:text-white">Research</a>
            <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 font-research text-[8px] uppercase tracking-[0.13em] text-white/28 sm:flex-row sm:items-center sm:justify-between">
          <span>AI assists. Humans experience. Researchers decide.</span>
          <span>© {new Date().getFullYear()} Usability Testing Platform</span>
        </div>
      </div>
    </footer>
  );
}
