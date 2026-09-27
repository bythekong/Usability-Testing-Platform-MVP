import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { JobStatus } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface Task {
  id: string;
  instruction: string;
  maxTimeLimit: number;
}

interface ResponseInfo {
  taskId: string;
  videoUrl: string | null;
  answerText: string | null;
}

interface TesterJob {
  id: string;
  status: JobStatus;
  campaign: {
    targetUrl: string;
    rewardAmount: number;
    currency: string;
    isLocked: boolean;
    tasks: Task[];
  };
  responses?: ResponseInfo[];
}

interface Props {
  job: TesterJob;
  onBack: () => void;
  onSubmitted: () => void;
}

export function ReviewJobView({ job, onBack, onSubmitted }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    job.responses?.forEach(r => {
      if (r.answerText) init[r.taskId] = r.answerText;
    });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (taskId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [taskId]: text }));
  };

  const handleSubmit = async () => {
    // Check if all tasks have answers
    const hasAllAnswers = job.campaign.tasks.every(t => !!answers[t.id]?.trim());
    if (!hasAllAnswers) {
      toast.error('Please provide a markdown review for all tasks.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        responses: job.campaign.tasks.map(t => ({
          taskId: t.id,
          answerText: answers[t.id]
        }))
      };

      await apiFetch(`/jobs/${job.id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast.success('Review submitted successfully!');
      onSubmitted();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Write Final Review</h2>
          <p className="text-sm text-muted">Watch your recorded videos and write a detailed markdown report for each task.</p>
        </div>
      </div>

      {job.campaign.tasks.map((task, index) => {
        const response = job.responses?.find(r => r.taskId === task.id);
        const videoUrl = response?.videoUrl;

        return (
          <div key={task.id} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Task {index + 1}</h3>
            <p className="text-foreground mb-4 bg-gray-50 p-3 rounded-md border border-gray-100">{task.instruction}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Session Video</h4>
                {videoUrl ? (
                  <video
                    src={process.env.NEXT_PUBLIC_API_URL + videoUrl}
                    controls
                    className="w-full rounded-md border border-gray-200 bg-black aspect-video object-contain"
                  />
                ) : (
                  <div className="flex aspect-video w-full flex-col p-4 text-center items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500">
                    <p>No video available.</p>
                    {job.campaign.isLocked && <p className="text-xs text-red-500 mt-1">This campaign has been locked by the owner.</p>}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h4 className="text-sm font-semibold mb-2">Your Review (Markdown supported)</h4>
                <textarea
                  className="w-full flex-1 min-h-[150px] p-3 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="e.g. **Findings:** I found the button easily, but..."
                  value={answers[task.id] || ''}
                  onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                />
                {answers[task.id] && (
                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm prose prose-sm max-w-none">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preview</p>
                    <ReactMarkdown>{answers[task.id]}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !job.campaign.tasks.every(t => !!answers[t.id]?.trim())}
          className="px-8 py-2 font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Final Review to Owner'}
        </Button>
      </div>
    </div>
  );
}
