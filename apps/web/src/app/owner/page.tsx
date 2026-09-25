'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { TestCampaignDTO } from '@usability-testing/shared';

export default function OwnerDashboard() {
  const [campaigns, setCampaigns] = useState<TestCampaignDTO[]>([]);
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState([{ instruction: '' }]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiFetch('/campaigns');
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          targetUrl: url,
          rewardAmount: 1000,
          tasks: tasks.filter(t => t.instruction.trim())
        })
      });
      setUrl('');
      setTasks([{ instruction: '' }]);
      fetchCampaigns();
    } catch (err) {
      alert('Failed to create campaign');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Target URL</label>
            <input
              required type="url" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full border rounded p-2" placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tasks</label>
            {tasks.map((task, i) => (
              <input
                key={i} required
                value={task.instruction}
                onChange={e => {
                  const newTasks = [...tasks];
                  newTasks[i].instruction = e.target.value;
                  setTasks(newTasks);
                }}
                className="w-full border rounded p-2 mb-2"
                placeholder="e.g. Find the pricing page"
              />
            ))}
            <button
              type="button"
              onClick={() => setTasks([...tasks, { instruction: '' }])}
              className="text-blue-600 text-sm mt-1"
            >
              + Add another task
            </button>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Campaign
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4">My Campaigns</h2>
      <div className="space-y-4">
        {campaigns.map(camp => (
          <div key={camp.id} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="font-bold text-lg">{camp.targetUrl}</h3>
            <p className="text-sm text-gray-500 mb-2">ID: {camp.id}</p>
            <h4 className="font-semibold text-sm mt-4">Jobs:</h4>
            <ul className="text-sm space-y-2 mt-2">
              {camp.jobs?.map(job => (
                <li key={job.id} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                  <span>Status: <strong>{job.status}</strong></span>
                  {job.status === 'SUBMITTED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await apiFetch(`/jobs/${job.id}/review`, {
                            method: 'POST', body: JSON.stringify({ status: 'APPROVED' })
                          });
                          fetchCampaigns();
                        }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >Approve</button>
                      <button
                        onClick={async () => {
                          await apiFetch(`/jobs/${job.id}/review`, {
                            method: 'POST', body: JSON.stringify({ status: 'REJECTED' })
                          });
                          fetchCampaigns();
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}