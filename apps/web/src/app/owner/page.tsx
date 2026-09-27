'use client';

import { useEffect, useState, Suspense } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, X, Lightbulb } from 'lucide-react';
import { JobStatus, TestCampaignDTO } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField, Input } from '@/components/ui/FormField';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TargetIcon } from '@/components/ui/TargetIcon';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface ReviewResponse {
  id: string;
  answerText: string | null;
  videoUrl: string | null;
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

function OwnerDashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'create';

  const [campaigns, setCampaigns] = useState<TestCampaignDTO[]>([]);
  const [url, setUrl] = useState('');
  const [rewardAmount, setRewardAmount] = useState(10);
  const [testerCount, setTesterCount] = useState(1);
  const [scenario, setScenario] = useState('');
  const [tasks, setTasks] = useState([{ instruction: '', maxTimeLimit: 300 }]);
  const [reviews, setReviews] = useState<Record<string, ReviewDetails>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  async function fetchCampaigns() {
    try {
      const data = await apiFetch('/campaigns');
      setCampaigns(data);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load campaigns');
      toast.error('Failed to load campaigns');
    }
  }

  useEffect(() => {
    let cancelled = false;
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.email) {
        Promise.resolve().then(() => setUserEmail(u.email));
      }
    } catch {
      // ignore
    }

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
    const createPromise = apiFetch('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        targetUrl: url,
        rewardAmount: Math.round(rewardAmount * 100), // Convert to cents
        testerCount,
        scenario: scenario.trim() || undefined,
        tasks: cleanTasks
      })
    }).then(async () => {
      setUrl('');
      setRewardAmount(10);
      setTesterCount(1);
      setScenario('');
      setTasks([{ instruction: '', maxTimeLimit: 300 }]);
      await fetchCampaigns();
    });

    toast.promise(createPromise, {
      loading: 'Launching campaign...',
      success: 'Campaign created successfully!',
      error: 'Failed to create campaign'
    });

    setCreating(false);
  };

  const loadReview = async (jobId: string) => {
    try {
      const details = await apiFetch('/jobs/' + jobId + '/review');
      setReviews((current) => ({ ...current, [jobId]: details }));
      setExpandedJobId(jobId);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Failed to load submission');
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
      toast.success(status === JobStatus.APPROVED ? 'Job approved!' : 'Job rejected.');
      await fetchCampaigns();
      await loadReview(jobId);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Failed to review job');
    }
  };

  if (currentTab === 'campaigns') {
    return (
      <>
        <PageHeader title="Manage Campaigns" description="Review active campaigns and approve tester submissions." />
        <section id="campaigns" className="min-w-0 mt-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Active Campaigns</h2>
            <span className="text-sm text-muted">{campaigns.length} total</span>
          </div>

          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Create your first campaign to make a usability test available to testers." />
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
                        const canInspect = [JobStatus.SUBMITTED, JobStatus.APPROVED, JobStatus.REJECTED].includes(job.status as JobStatus);
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
                                        <div className="min-w-0 w-full">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Task</p>
                                          <p className="mt-1 text-sm font-medium text-foreground">{response.task.instruction}</p>
                                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Tester response</p>
                                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                                            {response.answerText || '(No text answer)'}
                                          </p>
                                          {response.videoUrl && (
                                            <div className="mt-4">
                                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Task Recording</p>
                                              <video 
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${response.videoUrl}`} 
                                                controls 
                                                className="w-full rounded-md border border-border" 
                                                style={{ maxHeight: '300px' }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ol>

                                {job.status === JobStatus.SUBMITTED && (
                                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    <Button variant="outline" onClick={() => void reviewJob(job.id, JobStatus.REJECTED)}>
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
      </>
    );
  }

  if (currentTab === 'settings') {
    return (
      <>
        <PageHeader title="Account Settings" description="Manage your owner account and payment methods." />
        <div className="max-w-2xl space-y-6 mt-6">
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
            <FormField label="Email Address" htmlFor="email">
              <Input id="email" type="email" value={userEmail} readOnly disabled />
            </FormField>
            <p className="mt-2 text-xs text-muted">Your email is managed by your authentication provider.</p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">No payment method configured.</p>
              <Button disabled variant="outline">Add Credit Card</Button>
              <p className="mt-2 text-xs text-gray-400">Payment system integration coming soon.</p>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Default: create
  return (
    <>
      <PageHeader title="Create Campaign" description="Launch a new usability test for testers." />
      
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid items-start gap-8 xl:grid-cols-[1fr_300px] mt-6">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm order-2 xl:order-1">
          <h2 className="text-xl font-semibold text-foreground">New Campaign</h2>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Reward per Tester (USD)" htmlFor="reward">
                <Input
                  id="reward"
                  required
                  type="number"
                  min="1"
                  step="0.5"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(parseFloat(e.target.value) || 1)}
                  placeholder="10.00"
                />
              </FormField>
              <FormField label="Number of Testers" htmlFor="testers">
                <Input
                  id="testers"
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={testerCount}
                  onChange={(e) => setTesterCount(parseInt(e.target.value) || 1)}
                  placeholder="5"
                />
              </FormField>
            </div>

            <FormField label="Scenario / Context (Markdown Supported)" htmlFor="scenario">
              <textarea
                id="scenario"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Brief the tester on the context. E.g. 'Imagine you are a busy mom looking for a quick dinner recipe...'"
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Task Instructions</p>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex flex-col gap-2 rounded-lg border border-border p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Task {index + 1}</span>
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index))}
                          className="rounded-md p-1 text-muted transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          title="Remove task"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <Input
                      required
                      value={task.instruction}
                      onChange={(event) => {
                        const nextTasks = [...tasks];
                        nextTasks[index] = { ...nextTasks[index], instruction: event.target.value };
                        setTasks(nextTasks);
                      }}
                      placeholder="e.g. Find pricing and read it out loud"
                      aria-label={'Task ' + (index + 1)}
                    />
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted">Time Limit (mins):</label>
                      <Input
                        required
                        type="number"
                        min="1"
                        max="5"
                        value={task.maxTimeLimit / 60}
                        onChange={(event) => {
                          const val = parseInt(event.target.value) || 1;
                          const nextTasks = [...tasks];
                          nextTasks[index] = { ...nextTasks[index], maxTimeLimit: Math.min(5, Math.max(1, val)) * 60 };
                          setTasks(nextTasks);
                        }}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setTasks([...tasks, { instruction: '', maxTimeLimit: 300 }])}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus className="h-4 w-4" />
                Add another task
              </button>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 border border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cost per tester</span>
                <span className="font-medium">${rewardAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Total testers</span>
                <span className="font-medium">x {testerCount}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Campaign Cost</span>
                <span className="text-lg font-bold text-blue-600">${(rewardAmount * testerCount).toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating…' : 'Launch Campaign'}
            </Button>
          </form>
        </section>
        
        {/* Onboarding Guide Side Panel */}
        <aside className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm order-1 xl:order-2">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Tips for Good Tasks</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-3 list-disc pl-4">
            <li><strong>Be specific:</strong> Instead of &quot;Explore the site&quot;, use &quot;Find the return policy page.&quot;</li>
            <li><strong>Avoid leading questions:</strong> Let the user find the answer naturally.</li>
            <li><strong>Time limits:</strong> Most tasks should take 1-2 minutes. Only use 5 minutes for complex workflows.</li>
            <li><strong>Think out loud:</strong> Ask testers to speak their thoughts as they complete the task.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}

export default function OwnerDashboard() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <OwnerDashboardContent />
    </Suspense>
  );
}
