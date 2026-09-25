'use client';
import { Role } from '@usability-testing/shared';
import { useState } from 'react';

export default function Home() {
  const [role] = useState<Role>(Role.TESTER);

  const handleSyncExtension = () => {
    // Demo of Extension Sync via externally_connectable
    const extensionId = 'YOUR_CHROME_EXTENSION_ID_HERE'; // In a real app, this is in an env var
    const mockToken = 'jwt-token-placeholder';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).chrome.runtime.sendMessage(
        extensionId,
        { type: 'SYNC_AUTH', token: mockToken },
        (response: any) => {
          if (response?.success) {
            alert('Token successfully synced with Extension!');
          } else {
            alert('Extension did not respond. Is it installed?');
          }
        }
      );
    } else {
      alert('Chrome Extension API not available.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Usability Testing MVP</h1>
      <p className="text-xl mb-8">Role: {role}</p>

      <div className="flex gap-4">
        <button
          onClick={handleSyncExtension}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Sync Auth to Chrome Extension
        </button>
      </div>
    </main>
  );
}