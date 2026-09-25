'use client';

import { useEffect, useState } from 'react';
import { JobStatus } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';

interface TesterJob {
  id: string;
  status: JobStatus;
  campaign: {
    targetUrl: string;
    rewardAmount: number;
    currency: string;
  };
}

interface ExternalChromeRuntime {
  lastError?: { message?: string };
  sendMessage(
    extensionId: string,
    message: { type: string; token: string },
    callback: (response?: { success?: boolean; error?: string }) => void
  ): void;
}

export default function TesterDashboard() {
  const [availableJobs, setAvailableJobs] = useState<TesterJob[]>([]);
  const [myJobs, setMyJobs] = useState<TesterJob[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const [available, mine] = await Promise.all([
        apiFetch('/jobs/available'),
        apiFetch('/jobs/my')
      ]);
      setAvailableJobs(available);
      setMyJobs(mine);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load jobs');
    }
  }

  const claimJob = async (id: string) => {
    try {
      await apiFetch('/jobs/' + id + '/claim', { method: 'POST' });
      await fetchJobs();
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to claim job');
    }
  };

  const handleSyncExtension = () => {
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
    const token = localStorage.getItem('token');

    if (!extensionId) {
      alert('NEXT_PUBLIC_EXTENSION_ID is not configured. Set it and rebuild the web app.');
      return;
    }
    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    const chromeRuntime = (window as Window & {
      chrome?: { runtime?: ExternalChromeRuntime };
    }).chrome?.runtime;

    if (!chromeRuntime) {
      alert('Chrome Extension API not available.');
      return;
    }

    chromeRuntime.sendMessage(
      extensionId,
      { type: 'SYNC_AUTH', token },
      (response) => {
        if (chromeRuntime.lastError) {
          alert('Extension sync failed: ' + (chromeRuntime.lastError.message || 'Unknown Chrome error'));
          return;
        }
        if (response?.success) {
          alert('Authentication synchronized with the extension.');
        } else {
          alert(response?.error || 'Extension did not accept the session.');
        }
      }
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tester Dashboard</h1>
        <button
          onClick={handleSyncExtension}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold shadow-sm"
        >
          Sync Auth to Chrome Extension
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-6">{error}</div>}

      <h2 className="text-xl font-bold mb-4">My Jobs</h2>
      <div className="space-y-4 mb-8">
        {myJobs.map((job) => (
          <div key={job.id} className="bg-blue-50 p-4 rounded shadow border border-blue-200">
            <h3 className="font-bold text-lg">{job.campaign.targetUrl}</h3>
            <p className="text-sm">
              Status: <span className="font-semibold">{job.status}</span>
            </p>
            {job.status === JobStatus.CLAIMED && (
              <a
                href={job.campaign.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-blue-700 underline"
              >
                Open target website
              </a>
            )}
          </div>
        ))}
        {myJobs.length === 0 && <p className="text-gray-500">You have not claimed any jobs yet.</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Available Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableJobs.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded shadow border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">{job.campaign.targetUrl}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Reward: {job.campaign.rewardAmount / 100} {job.campaign.currency}
              </p>
            </div>
            <button
              onClick={() => void claimJob(job.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Claim Job
            </button>
          </div>
        ))}
        {availableJobs.length === 0 && <p className="text-gray-500">No jobs available right now.</p>}
      </div>
    </div>
  );
}
