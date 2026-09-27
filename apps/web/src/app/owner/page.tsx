'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { JobStatus, TestCampaignDTO } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField, Input } from '@/components/ui/FormField';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TargetIcon } from '@/components/ui/TargetIcon';

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

function badgeTone(status: JobStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === JobStatus.APPROVED) return 'success';
  if (status === JobStatus.REJECTED) return 'danger';
  if (status === JobStatus.CLAIMED || status === JobStatus.SUBMITTED) return 'warning';
  return 'neutral';
}

function formatReward(amount: number, currency: string) {
  if (currency === 'USD') return '$' + (amount / 100).toFixed(2);
  return (amount / 100).toFixed(2) + ' ' + currency;
}

function shortId(id: string) {
  return id.length > 12 ? id.slice(0, 8) + '…' : id;
}

export default function OwnerDashboard() {
  const [campaigns, setCampaigns] = useState<TestCampaignDTO[]>([]);
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState([{ instruction: '' }]);
  const [reviews, setReviews] = useState<Record<string, ReviewDetails>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  async function fetchCampaigns() {
    try {
      const data = await apiFetch('/campaigns');
      setCampaigns(data);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load campaigns');
    }
  }

  useEffect(() => {
    let cancelled = false;

    apiFetch('/campaigns')
      .then((data) => {
        if (!cancelled) setCampaigns(data);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Failed to load campaigns');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTasks = tasks.filter((task) => task.instruction.trim());
    if (!cleanTasks.length) return;

    setCreating(true);
    try {
      await apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          targetUrl: url,
          rewardAmount: 1000,
          tasks: cleanTasks
        })
      });
      setUrl('');
      setTasks([{ instruction: '' }]);
      await fetchCampaigns();
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const loadReview = async (jobId: string) => {
    try {
      const details = await apiFetch('/jobs/' + jobId + '/review');
      setReviews((current) => ({ ...current, [jobId]: details }));
      setExpandedJobId(jobId);
    } catch (caught) {
      alert(caught instanceof Error ? caught.message : 'Failed to load submission');
    }
  };

  const toggleReview = async (jobId: string, status: JobStatus) => {
    if (![JobStatus.SUBMITTED, JobStatus.APPROVED, JobStatus.REJECTED].includes(status)) return;

    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }

    if (!reviews[jobId]) {
      await loadReview(jobId);
      return;
    }

    setExpandedJobId(jobId);
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
    <>
      <PageHeader
        title="Owner Dashboard"
        description="Manage your usability test campaigns and review submissions."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid items-start gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Create Campaign</h2>

          <form onSubmit={handleCreate} className="mt-6 space-y-5">
            <FormField label="Target URL" htmlFor="target-url">
              <Input
                id="target-url"
                required
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Task Instructions</p>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      required
                      value={task.instruction}
                      onChange={(event) => {
                        const nextTasks = [...tasks];
                        nextTasks[index] = { instruction: event.target.value };
                        setTasks(nextTasks);
                      }}
                      placeholder={'Step ' + (index + 1) + ' (e.g. Find pricing)'}
                      aria-label={'Task ' + (index + 1)}
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index))}
                        className="rounded-md p-2 text-muted transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Remove task"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setTasks([...tasks, { instruction: '' }])}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus className="h-4 w-4" />
                Add another step
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating…' : 'Launch Campaign'}
            </Button>
          </form>
        </section>

        <section id="campaigns" className="min-w-0">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Active Campaigns</h2>
            <span className="text-sm text-muted">{campaigns.length} total</span>
          </div>

          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              description="Create your first campaign to make a usability test available to testers."
            />
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <article key={campaign.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <TargetIcon url={campaign.targetUrl} />
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">{campaign.targetUrl}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted">Campaign ID: {campaign.id}</p>
                      </div>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatReward(campaign.rewardAmount, campaign.currency)}
                      </p>
                      <p className="text-xs text-muted">Reward</p>
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <div className="mb-3 flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">Job Submissions</h4>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted">
                        {campaign.jobs.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {campaign.jobs.map((job) => {
                        const review = reviews[job.id];
                        const canInspect = [JobStatus.SUBMITTED, JobStatus.APPROVED, JobStatus.REJECTED].includes(job.status);
                        const expanded = expandedJobId === job.id;

                        return (
                          <div key={job.id} className="overflow-hidden rounded-lg border border-border bg-background/60">
                            <button
                              type="button"
                              onClick={() => void toggleReview(job.id, job.status)}
                              className={[
                                'flex w-full items-center justify-between gap-3 px-3 py-3 text-left',
                                canInspect ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                              ].join(' ')}
                              aria-expanded={canInspect ? expanded : undefined}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <StatusBadge status={badgeTone(job.status)}>{job.status}</StatusBadge>
                                <span className="truncate font-mono text-xs text-muted">{shortId(job.id)}</span>
                              </div>
                              {canInspect && (
                                expanded
                                  ? <ChevronUp className="h-4 w-4 text-muted" />
                                  : <ChevronDown className="h-4 w-4 text-muted" />
                              )}
                            </button>

                            {expanded && review && (
                              <div className="border-t border-border bg-surface px-4 py-4">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm text-muted">
                                    Tester: <span className="font-medium text-foreground">{review.tester?.email || 'Unknown'}</span>
                                  </p>
                                  <StatusBadge status={badgeTone(review.status)}>{review.status}</StatusBadge>
                                </div>

                                <ol className="space-y-3">
                                  {review.responses.map((response) => (
                                    <li key={response.id} className="rounded-lg border border-border bg-background px-4 py-3">
                                      <div className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                          {response.task.stepOrder}
                                        </span>
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Task</p>
                                          <p className="mt-1 text-sm font-medium text-foreground">{response.task.instruction}</p>
                                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Tester response</p>
                                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                                            {response.answerText || '(No answer)'}
                                          </p>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ol>

                                {job.status === JobStatus.SUBMITTED && (
                                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => void reviewJob(job.id, JobStatus.REJECTED)}
                                    >
                                      Reject
                                    </Button>
                                    <Button onClick={() => void reviewJob(job.id, JobStatus.APPROVED)}>
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
