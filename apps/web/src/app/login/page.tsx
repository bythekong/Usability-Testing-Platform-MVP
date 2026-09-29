'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Role } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

function resolveRequestedRole(value: string | null): Role {
  return value?.toUpperCase() === Role.TESTER ? Role.TESTER : Role.OWNER;
}

function LoginContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const requestedRole = resolveRequestedRole(searchParams.get('role'));
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password123');
  const [roleOverride, setRoleOverride] = useState<Role | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const role = roleOverride ?? requestedRole;

  const persistSessionAndRoute = (data: { token: string; user: { role: Role } }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push(data.user.role === Role.OWNER ? '/owner' : '/tester');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      persistSessionAndRoute(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      persistSessionAndRoute(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{t('title')}</h1>
          <p className="text-sm text-muted mt-2">{t('subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-danger-bg text-danger-text text-sm font-medium border border-danger/20">
            {error}
          </div>
        )}

        <form className="space-y-5">
          <FormField label={t('emailLabel')} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={loading}
              required
            />
          </FormField>

          <FormField label={t('passwordLabel')} htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </FormField>

          <FormField label={t('roleLabel')} htmlFor="role">
            <select
              id="role"
              value={role}
              onChange={(e) => setRoleOverride(e.target.value as Role)}
              className="flex h-10 w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow,background-color] focus-visible:border-primary focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <option value={Role.OWNER}>{t('roleOwner')}</option>
              <option value={Role.TESTER}>{t('roleTester')}</option>
            </select>
          </FormField>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleLogin}
              type="button"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-muted">{t('orContinue')}</span>
              </div>
            </div>
            <Button
              onClick={handleRegister}
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              {t('register')}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-muted">
          Loading...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
