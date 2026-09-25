'use client';
import { useState } from 'react';
import { Role } from '@usability-testing/shared';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<Role>(Role.OWNER);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === Role.OWNER) {
        router.push('/owner');
      } else {
        router.push('/tester');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === Role.OWNER) {
        router.push('/owner');
      } else {
        router.push('/tester');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Usability Testing</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role (For Register)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value={Role.OWNER}>Owner (Create Tests)</option>
              <option value={Role.TESTER}>Tester (Take Tests)</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleLogin}
              type="button"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              type="button"
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}