'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { JobStatus } from '@usability-testing/shared';
import { ReviewJobView } from '@/app/tester/ReviewJobView';
import { Loader2 } from 'lucide-react';


interface TesterJob {
  id: string;
  status: JobStatus;
  campaign: {
    targetUrl: string;
    rewardAmount: number;
    currency: string;
    isLocked: boolean;
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

export default function TesterJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;


  const [job, setJob] = useState<TesterJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiFetch('/jobs/my')
      .then((jobs: TesterJob[]) => {
        if (cancelled) return;
        const found = jobs.find(j => j.id === jobId);
        if (found) {
          setJob(found);
        } else {
          setError('Job not found or not claimed by you.');
        }
        setLoading(false);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Failed to load job');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <div className="rounded-lg border border-danger/20 bg-danger-bg p-4 text-danger-text">
          <p className="font-semibold">Error</p>
          <p>{error || 'Job not found'}</p>
          <button 
            onClick={() => router.push('/tester?tab=my-jobs')}
            className="mt-4 text-sm font-medium text-danger hover:underline"
          >
            &larr; Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <ReviewJobView 
        job={job}
        onBack={() => router.push('/tester?tab=my-jobs')}
        onSubmitted={() => router.push('/tester?tab=my-jobs')}
      />
    </div>
  );
}
