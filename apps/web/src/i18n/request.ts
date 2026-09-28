import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/services/locale';

export default getRequestConfig(async () => {
  // Read the locale from the cookie (or default)
  const locale = await getUserLocale();

  return {
    locale,
    // Import the corresponding dictionary file dynamically
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
