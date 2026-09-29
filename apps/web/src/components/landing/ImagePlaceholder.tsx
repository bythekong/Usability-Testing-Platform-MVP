import { ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  title: string;
  description: string;
  aspectRatio: string;
  dimensions: string;
  filePath: string;
  className?: string;
  priorityLabel?: string;
}

export function ImagePlaceholder({
  title,
  description,
  aspectRatio,
  dimensions,
  filePath,
  className = '',
  priorityLabel = 'FPO IMAGE',
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${priorityLabel}: ${description}`}
      className={`group relative overflow-hidden rounded-[2rem] border border-dashed border-primary/35 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),transparent_48%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%)] ${className}`}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-background/75 text-primary shadow-sm backdrop-blur">
          <ImageIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-primary/25 bg-background/80 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-primary backdrop-blur">
          {priorityLabel}
        </span>
        <h3 className="mt-4 max-w-xl text-lg font-semibold text-foreground md:text-xl">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-muted">
          <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{aspectRatio}</span>
          <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{dimensions}</span>
        </div>
        <code className="mt-3 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-border bg-background/75 px-3 py-2 text-[11px] text-muted">
          {filePath}
        </code>
      </div>
    </div>
  );
}
