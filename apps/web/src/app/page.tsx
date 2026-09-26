'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@usability-testing/shared';
import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';

export default function Home() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<Role>(Role.OWNER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Usability Testing</h1>
          <p className="text-sm text-muted mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-danger-bg text-danger-text text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-5">
          <FormField label="Email address" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </FormField>

          <FormField label="Role (for registration)" htmlFor="role">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <option value={Role.OWNER}>Owner (Create Tests)</option>
              <option value={Role.TESTER}>Tester (Take Tests)</option>
            </select>
          </FormField>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleLogin}
              type="button"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-muted">Or continue with</span>
              </div>
            </div>
            <Button
              onClick={handleRegister}
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              Register New Account
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
