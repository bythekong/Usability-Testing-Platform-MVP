'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { JobStatus } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TargetIcon } from '@/components/ui/TargetIcon';

interface TesterJob {
  id: string;
  status: JobStatus;
  campaign: {
    targetUrl: string;
    rewardAmount: number;
    currency: string;
    tasks: { maxTimeLimit: number }[];
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

function formatReward(amount: number, currency: string) {
  if (currency === 'USD') return '$' + (amount / 100).toFixed(2);
  return (amount / 100).toFixed(2) + ' ' + currency;
}

function calculateEstimatedTime(tasks: { maxTimeLimit: number }[]) {
  if (!tasks || tasks.length === 0) return '0 min';
  const totalSeconds = tasks.reduce((sum, task) => sum + (task.maxTimeLimit || 300), 0);
  return Math.ceil(totalSeconds / 60) + ' min';
}

function badgeTone(status: JobStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === JobStatus.APPROVED) return 'success';
  if (status === JobStatus.REJECTED) return 'danger';
  if (status === JobStatus.CLAIMED || status === JobStatus.SUBMITTED) return 'warning';
  return 'neutral';
}

export default function TesterDashboard() {
  const [availableJobs, setAvailableJobs] = useState<TesterJob[]>([]);
  const [myJobs, setMyJobs] = useState<TesterJob[]>([]);
  const [error, setError] = useState('');

  async function fetchJobs() {
    try {
      const [available, mine] = await Promise.all([
        apiFetch('/jobs/available'),
        apiFetch('/jobs/my')
      ]);
      setAvailableJobs(available);
      setMyJobs(mine);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load jobs');
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch('/jobs/available'),
      apiFetch('/jobs/my')
    ])
      .then(([available, mine]) => {
        if (cancelled) return;
        setAvailableJobs(available);
        setMyJobs(mine);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Failed to load jobs');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeJobs = useMemo(
    () => myJobs.filter((job) => job.status === JobStatus.CLAIMED),
    [myJobs]
  );

  const pastJobs = useMemo(
    () => myJobs.filter((job) => job.status !== JobStatus.CLAIMED),
    [myJobs]
  );

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
    <>
      <PageHeader
        title="Tester Dashboard"
        description="Find usability tests, claim jobs, and earn rewards."
        actions={
          <div id="extension-sync">
            <Button onClick={handleSyncExtension}>
            <RefreshCw className="mr-2 h-4 w-4" />
              Sync Extension
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section id="my-jobs">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Active Jobs</h2>
        {activeJobs.length === 0 ? (
          <EmptyState
            title="No active jobs"
            description="Claim an available usability test to start working."
            className="mb-10"
          />
        ) : (
          <div className="mb-10 grid gap-4 lg:grid-cols-2">
            {activeJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <StatusBadge status="warning">In Progress</StatusBadge>
                  <span className="text-sm font-semibold text-foreground">
                    {formatReward(job.campaign.rewardAmount, job.campaign.currency)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <TargetIcon url={job.campaign.targetUrl} />
                  <h3 className="truncate text-base font-semibold text-foreground">{job.campaign.targetUrl}</h3>
                </div>

                <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
                  <p>Open this URL in a new tab with the extension connected to start testing.</p>
                  <p className="font-medium">Estimated time: ~{calculateEstimatedTime(job.campaign.tasks)}</p>
                </div>

                <a
                  href={job.campaign.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Open Target URL
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="available-jobs">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Available Jobs</h2>
          <span className="text-sm text-muted">{availableJobs.length} available</span>
        </div>

        {availableJobs.length === 0 ? (
          <EmptyState
            title="No jobs available"
            description="There are currently no usability tests available to claim. Check back later."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableJobs.map((job) => (
              <article key={job.id} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <TargetIcon url={job.campaign.targetUrl} />
                  <span className="text-sm font-semibold text-foreground">
                    {formatReward(job.campaign.rewardAmount, job.campaign.currency)}
                  </span>
                </div>
                <h3 className="mt-4 truncate text-base font-semibold text-foreground">{job.campaign.targetUrl}</h3>
                <div className="mt-1 flex items-center justify-between text-sm text-muted">
                  <span>Usability testing job</span>
                  <span>~{calculateEstimatedTime(job.campaign.tasks)}</span>
                </div>
                <Button className="mt-5 w-full" onClick={() => void claimJob(job.id)}>
                  Claim Job
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      {pastJobs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Past Submissions</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {pastJobs.map((job, index) => (
              <div
                key={job.id}
                className={[
                  'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                  index > 0 ? 'border-t border-border' : ''
                ].join(' ')}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TargetIcon url={job.campaign.targetUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{job.campaign.targetUrl}</p>
                    <p className="text-xs text-muted">{formatReward(job.campaign.rewardAmount, job.campaign.currency)}</p>
                  </div>
                </div>
                <StatusBadge status={badgeTone(job.status)}>{job.status}</StatusBadge>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
