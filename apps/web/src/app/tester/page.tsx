'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { ExternalLink, RefreshCw, Plug } from 'lucide-react';
import { JobStatus } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TargetIcon } from '@/components/ui/TargetIcon';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Input, FormField } from '@/components/ui/FormField';

interface TesterJob {
  id: string;
  status: JobStatus;
  campaign: {
    targetUrl: string;
    rewardAmount: number;
    currency: string;
    isLocked: boolean;
    scenario?: string;
    tasks: {
      id: string;
      stepOrder: number;
      instruction: string;
      maxTimeLimit: number;
      taskType: string;
      taskUrl: string | null;
      choices: string[];
      ratingMin: number | null;
      ratingMax: number | null;
      ratingMinLabel: string | null;
      ratingMaxLabel: string | null;
    }[];
  };
  responses?: {
    taskId: string;
    videoUrl: string | null;
    answerText: string | null;
    structuredAnswer: { type: string; value: string | number } | null;
    structuredAnswerLockedAt: string | null;
  }[];
}

interface ExternalChromeRuntime {
  lastError?: { message?: string };
  sendMessage(
    extensionId: string,
    message: Record<string, unknown>,
    callback: (response: { success?: boolean; error?: string }) => void
  ): void;
}

function formatReward(amount: number, currency: string) {
  if (currency === 'THB') return '฿' + (amount / 100).toLocaleString('th-TH');
  if (currency === 'THB') return (amount / 100).toLocaleString('th-TH') + ' THB';
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



function TesterDashboardContent() {
  const t = useTranslations('tester');
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'available';

  const [availableJobs, setAvailableJobs] = useState<TesterJob[]>([]);
  const [myJobs, setMyJobs] = useState<TesterJob[]>([]);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Profile states
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [itExpertise, setItExpertise] = useState<string>('');

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
      toast.error('Failed to load jobs');
    }
  }

  async function saveProfile() {
    try {
      const payload = {
        age: age ? parseInt(age) : null,
        gender: gender || null,
        occupation: occupation || null,
        itExpertise: itExpertise || null,
      };
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      toast.success('Profile saved successfully');
      fetchJobs(); // Re-fetch available jobs in case targeting matches changed
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save profile');
    }
  }

  useEffect(() => {
    let cancelled = false;

    // Load email and profile for settings
    apiFetch('/auth/me').then(u => {
      if (!cancelled) {
        if (u.email) setUserEmail(u.email);
        if (u.age) setAge(u.age.toString());
        if (u.gender) setGender(u.gender);
        if (u.occupation) setOccupation(u.occupation);
        if (u.itExpertise) setItExpertise(u.itExpertise);
      }
    }).catch(() => {});

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
      toast.success('Job claimed successfully! Check "My Jobs" to start testing.');
      await fetchJobs();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Failed to claim job');
    }
  };

  const handleSyncExtension = () => {
    // @ts-expect-error — window.TEST_EXTENSION_ID is injected by Cypress/test environments
    const extensionId = window.TEST_EXTENSION_ID || process.env.NEXT_PUBLIC_EXTENSION_ID;
    const token = localStorage.getItem('token');

    if (!extensionId) {
      toast.error('NEXT_PUBLIC_EXTENSION_ID is not configured. Set it and rebuild.');
      return;
    }
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    const chromeRuntime = (window as Window & {
      chrome?: { runtime?: ExternalChromeRuntime };
    }).chrome?.runtime;

    if (!chromeRuntime) {
      toast.error('Chrome Extension API not available. Are you using Chrome?');
      return;
    }

    const syncPromise = new Promise((resolve, reject) => {
      try {
        chromeRuntime.sendMessage(
          extensionId,
          { type: 'SYNC_AUTH', token },
          (response) => {
            if (chromeRuntime.lastError) {
              reject(new Error('Extension sync failed: ' + (chromeRuntime.lastError.message || 'Unknown error')));
              return;
            }
            if (response?.success) {
              resolve('Authentication synchronized with the extension.');
            } else {
              reject(new Error(response?.error || 'Extension did not accept the session.'));
            }
          }
        );
      } catch (e: unknown) {
        reject(new Error('Extension sync failed synchronously: ' + (e instanceof Error ? e.message : String(e))));
      }
    });

    toast.promise(syncPromise, {
      loading: 'Syncing...',
      success: 'Extension synced successfully!',
      error: (err) => err.message
    });
  };

  if (currentTab === 'my-jobs') {
    return (
      <>
        <PageHeader title={t("myJobs.title")} description={t("myJobs.desc")} />
        <section id="my-jobs">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{t("activeJobs")}</h2>
          {activeJobs.length === 0 ? (
            <EmptyState title={t("noActiveJobs")} description={t("noActiveJobsDesc")} className="mb-10" />
          ) : (
            <div className="mb-10 grid gap-4 lg:grid-cols-2">
              {activeJobs.map((job) => (
                <article key={job.id} className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <StatusBadge status="warning">{t("inProgress")}</StatusBadge>
                    <span className="text-sm font-semibold text-foreground">{formatReward(job.campaign.rewardAmount, job.campaign.currency)}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <TargetIcon url={job.campaign.isLocked ? 'https://locked.test' : job.campaign.targetUrl} />
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {job.campaign.isLocked ? '[Locked by Owner]' : job.campaign.targetUrl}
                    </h3>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
                    <p>{t("openUrl")}</p>
                    <p className="font-medium">{t("estimatedTime")} ~{calculateEstimatedTime(job.campaign.tasks)}</p>
                  </div>
                  <div className="mt-5 flex gap-3">
                    {!job.campaign.isLocked ? (
                      <button
                        onClick={() => {
                          // Sync session to extension before opening URL
                          const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
                          const chromeRuntime = (window as Window & {
                            chrome?: { runtime?: ExternalChromeRuntime };
                          }).chrome?.runtime;

                          if (chromeRuntime && extensionId) {
                            const completedTaskIds = job.responses?.map(r => r.taskId) || [];
                            const incompleteTask = job.campaign.tasks.find(t => !completedTaskIds.includes(t.id)) || job.campaign.tasks[0];
                            const startUrl = incompleteTask?.taskUrl || job.campaign.targetUrl;

                            chromeRuntime.sendMessage(
                              extensionId,
                              { type: 'START_SESSION', job: { id: job.id, campaign: job.campaign }, completedTaskIds },
                              (response) => {
                                if (response?.success) {
                                  console.log('Session synced to extension');
                                } else {
                                  console.warn('Session sync failed:', response?.error);
                                }
                                window.open(startUrl, '_blank');
                              }
                            );
                          } else {
                            // Extension not available, just open
                            const completedTaskIds = job.responses?.map(r => r.taskId) || [];
                            const incompleteTask = job.campaign.tasks.find(t => !completedTaskIds.includes(t.id)) || job.campaign.tasks[0];
                            const startUrl = incompleteTask?.taskUrl || job.campaign.targetUrl;
                            window.open(startUrl, '_blank');
                          }
                        }}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40 px-4 text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-200 dark:hover:bg-blue-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Open URL
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </button>
                    ) : (
                      <div className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-muted/30 px-4 text-sm font-medium text-muted cursor-not-allowed">
                        Locked by Owner
                      </div>
                    )}
                    {job.responses && job.responses.length >= job.campaign.tasks.length ? (
                      <Button className="flex-1" onClick={() => router.push(`/tester/jobs/${job.id}`)}>
                        Write Review
                      </Button>
                    ) : (
                      <Button className="flex-1 opacity-50 cursor-not-allowed" disabled title="Record videos using extension first">
                        Record Video First
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {pastJobs.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">{t("pastSubmissions")}</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              {pastJobs.map((job, index) => (
                <div key={job.id} className={['flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between', index > 0 ? 'border-t border-border' : ''].join(' ')}>
                  <div className="flex min-w-0 items-center gap-3">
                    <TargetIcon url={job.campaign.isLocked ? 'https://locked.test' : job.campaign.targetUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {job.campaign.isLocked ? '[Locked by Owner]' : job.campaign.targetUrl}
                      </p>
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

  if (currentTab === 'extension-sync') {
    return (
      <>
        <PageHeader title={t("extension.title")} description={t("extension.desc")} />
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Plug className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{t("connectExt")}</h2>
            <p className="mt-2 text-sm text-muted">{t("connectExtDesc")}</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/30 font-semibold text-muted">1</div>
              <div>
                <h3 className="font-semibold text-foreground">{t("installExt")}</h3>
                <p className="mt-1 text-sm text-muted">{t("installExtDesc")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/30 font-semibold text-muted">2</div>
              <div>
                <h3 className="font-semibold text-foreground">{t("syncAccount")}</h3>
                <p className="mt-1 text-sm text-muted mb-3">{t("syncAccountDesc")}</p>
                <Button onClick={handleSyncExtension}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Extension Now
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/30 font-semibold text-muted">3</div>
              <div>
                <h3 className="font-semibold text-foreground">{t("startTesting")}</h3>
                <p className="mt-1 text-sm text-muted">{t("startTestingDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'settings') {
    return (
      <>
        <PageHeader title={t("settings.title")} description={t("settings.testerDesc")} />
        <div className="max-w-2xl space-y-6">
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("profileInfo")}</h2>
            <FormField label="Email Address" htmlFor="email">
              <Input id="email" type="email" value={userEmail} readOnly disabled />
            </FormField>
            <p className="mt-2 text-xs text-muted mb-4">{t("emailManaged")}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Age" htmlFor="age">
                <Input id="age" type="number" min="13" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 25" />
              </FormField>
              
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-foreground">Gender</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">{t("select")}</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <FormField label="Occupation" htmlFor="occupation">
                <Input id="occupation" type="text" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g. Student, Designer" />
              </FormField>
              
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-foreground">IT Expertise</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={itExpertise} onChange={e => setItExpertise(e.target.value)}>
                  <option value="">{t("select")}</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>
            <Button className="mt-6" onClick={saveProfile}>{t("saveProfile")}</Button>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("payoutMethod")}</h2>
            <div className="rounded-lg bg-muted/20 border border-border p-4 text-center">
              <p className="text-sm text-muted mb-3">{t("noPayout")}</p>
              <Button disabled variant="outline">{t("connectBank")}</Button>
              <p className="mt-2 text-xs text-gray-400">{t("paymentComingSoon")}</p>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Default: available
  return (
    <>
      <PageHeader title={t("availableJobs.title")} description={t("availableJobs.desc")} />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section id="available-jobs">
        {availableJobs.length === 0 ? (
          <EmptyState title={t("noJobsAvailable")} description={t("noJobsAvailableDesc")} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableJobs.map((job) => (
              <article key={job.id} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <TargetIcon url={job.campaign.targetUrl} />
                  <span className="text-sm font-semibold text-foreground">{formatReward(job.campaign.rewardAmount, job.campaign.currency)}</span>
                </div>
                <h3 className="mt-4 truncate text-base font-semibold text-foreground">{job.campaign.targetUrl}</h3>
                <div className="mt-1 flex items-center justify-between text-sm text-muted">
                  <span>{t("usabilityJob")}</span>
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
    </>
  );
}

export default function TesterDashboard() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <TesterDashboardContent />
    </Suspense>
  );
}



