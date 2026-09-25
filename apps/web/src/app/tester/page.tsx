'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function TesterDashboard() {
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const [avail, mine] = await Promise.all([
        apiFetch('/jobs/available'),
        apiFetch('/jobs/my')
      ]);
      setAvailableJobs(avail);
      setMyJobs(mine);
    } catch (err) {
      console.error(err);
    }
  };

  const claimJob = async (id: string) => {
    try {
      await apiFetch(`/jobs/${id}/claim`, { method: 'POST' });
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSyncExtension = () => {
    const extensionId = 'YOUR_CHROME_EXTENSION_ID_HERE';
    const token = localStorage.getItem('token');

    if (!token) return alert('No token found. Please log in again.');

    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
      (window as any).chrome.runtime.sendMessage(
        extensionId,
        { type: 'SYNC_AUTH', token },
        (response: any) => {
          if (response?.success) {
            alert('Token successfully synced with Extension! You can now start testing.');
          } else {
            alert('Extension did not respond. Is it installed and is the ID correct?');
          }
        }
      );
    } else {
      alert('Chrome Extension API not available.');
    }
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

      <h2 className="text-xl font-bold mb-4">My Claimed Jobs</h2>
      <div className="space-y-4 mb-8">
        {myJobs.map(job => (
          <div key={job.id} className="bg-blue-50 p-4 rounded shadow border border-blue-200">
            <h3 className="font-bold text-lg">{job.campaign?.targetUrl}</h3>
            <p className="text-sm">Status: <span className="font-semibold">{job.status}</span></p>
            {job.status === 'CLAIMED' && (
              <p className="text-sm text-gray-600 mt-2">
                Open this URL in a new tab with the extension connected to start!
              </p>
            )}
          </div>
        ))}
        {myJobs.length === 0 && <p className="text-gray-500">You haven't claimed any jobs yet.</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Available Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableJobs.map(job => (
          <div key={job.id} className="bg-white p-4 rounded shadow border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">{job.campaign?.targetUrl}</h3>
              <p className="text-sm text-gray-600 mb-4">Reward: {job.campaign?.rewardAmount / 100} USD</p>
            </div>
            <button
              onClick={() => claimJob(job.id)}
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