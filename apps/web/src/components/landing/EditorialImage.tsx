'use client';

import Image from 'next/image';

interface EditorialImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  overlay?: boolean;
}

export function EditorialImage({
  src,
  alt,
  sizes,
  className = '',
  imageClassName = '',
  objectPosition = '50% 50%',
  priority = false,
  overlay = true,
}: EditorialImageProps) {
  return (
    <div
      className={`group relative isolate overflow-hidden rounded-[2rem] bg-surface ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] ${imageClassName}`}
        style={{ objectPosition }}
      />
      {overlay ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
          />
        </>
      ) : null}
    </div>
  );
}
