'use server';

import { cookies } from 'next/headers';

// In this MVP, we store the user's preferred locale in a cookie
const COOKIE_NAME = 'NEXT_LOCALE';
const defaultLocale = 'th';

export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
