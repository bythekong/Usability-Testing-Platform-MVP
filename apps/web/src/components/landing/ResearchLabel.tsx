interface ResearchLabelProps {
  index: string;
  label: string;
  tone?: 'dark' | 'light';
  className?: string;
}

export function ResearchLabel({ index, label, tone = 'light', className = '' }: ResearchLabelProps) {
  return (
    <p
      className={`font-research text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px] ${
        tone === 'dark' ? 'text-[var(--lab-amber)]' : 'text-[var(--lab-oxide)]'
      } ${className}`}
    >
      {index} / {label}
    </p>
  );
}
