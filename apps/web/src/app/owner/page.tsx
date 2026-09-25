'use client';

import { useEffect, useState } from 'react';
import { JobStatus, TestCampaignDTO } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';

interface ReviewResponse {
  id: string;
  answerText: string | null;
  task: {
    id: string;
    stepOrder: number;
    instruction: string;
  };
}

interface ReviewDetails {
  id: string;
  status: JobStatus;
  tester: { id: string; email: string } | null;
  videoUrl: string | null;
  videoMetadata: unknown;
  responses: ReviewResponse[];
}

export default function OwnerDashboard() {
  const [campaigns, setCampaigns] = useState<TestCampaignDTO[]>([]);
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState([{ instruction: '' }]);
  const [reviews, setReviews] = useState<Record<string, ReviewDetails>>({});
  const [error, setError] = useState('');

  async function fetchCampaigns() {
    try {
      const data = await apiFetch('/campaigns');
      setCampaigns(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load campaigns');
    }
  }

  useEffect(() => {
    void fetchCampaigns();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          targetUrl: url,
          rewardAmount: 1000,
          tasks: tasks.filter((task) => task.instruction.trim())
        })
      });
      setUrl('');
      setTasks([{ instruction: '' }]);
      await fetchCampaigns();
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to create campaign');
    }
  };

  const loadReview = async (jobId: string) => {
    try {
      const details = await apiFetch('/jobs/' + jobId + '/review');
      setReviews((current) => ({ ...current, [jobId]: details }));
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to load submission');
    }
  };

  const reviewJob = async (jobId: string, status: JobStatus.APPROVED | JobStatus.REJECTED) => {
    try {
      await apiFetch('/jobs/' + jobId + '/review', {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      await fetchCampaigns();
      await loadReview(jobId);
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to review job');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-6">{error}</div>}

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Target URL</label>
            <input
              required
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full border rounded p-2"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tasks</label>
            {tasks.map((task, index) => (
              <input
                key={index}
                required
                value={task.instruction}
                onChange={(event) => {
                  const nextTasks = [...tasks];
                  nextTasks[index] = { instruction: event.target.value };
                  setTasks(nextTasks);
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
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white p-4 rounded shadow border border-gray-200">
            <h3 className="font-bold text-lg">{campaign.targetUrl}</h3>
            <p className="text-sm text-gray-500 mb-2">ID: {campaign.id}</p>
            <h4 className="font-semibold text-sm mt-4">Jobs:</h4>

            <div className="space-y-3 mt-2">
              {campaign.jobs.map((job) => {
                const review = reviews[job.id];
                return (
                  <div key={job.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center gap-3">
                      <span>
                        Status: <strong>{job.status}</strong>
                      </span>
                      {[JobStatus.SUBMITTED, JobStatus.APPROVED, JobStatus.REJECTED].includes(job.status) && (
                        <button
                          onClick={() => void loadReview(job.id)}
                          className="border border-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {review ? 'Refresh submission' : 'View submission'}
                        </button>
                      )}
                    </div>

                    {review && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm mb-3">
                          Tester: <strong>{review.tester?.email || 'Unknown'}</strong>
                        </p>
                        <ol className="space-y-3">
                          {review.responses.map((response) => (
                            <li key={response.id} className="bg-white border rounded p-3">
                              <p className="font-medium">
                                {response.task.stepOrder}. {response.task.instruction}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                                {response.answerText || '(No answer)'}
                              </p>
                            </li>
                          ))}
                        </ol>

                        {job.status === JobStatus.SUBMITTED && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => void reviewJob(job.id, JobStatus.APPROVED)}
                              className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => void reviewJob(job.id, JobStatus.REJECTED)}
                              className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
