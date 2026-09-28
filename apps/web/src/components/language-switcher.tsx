'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/services/locale';

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = React.useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'th' ? 'en' : 'th';
    startTransition(() => {
      setUserLocale(nextLocale).then(() => {
        // Next.js app router doesn't automatically re-render server components 
        // strictly on cookie change unless we refresh. A window reload is the most robust way.
        window.location.reload();
      });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
      aria-label="Toggle language"
    >
      {locale === 'th' ? 'EN' : 'TH'}
    </button>
  );
}
