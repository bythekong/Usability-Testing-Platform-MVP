import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { JobStatus, TaskType } from '@usability-testing/shared';
import { apiFetch } from '../../lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Lock } from 'lucide-react';

interface Task {
  id: string;
  instruction: string;
  maxTimeLimit: number;
  taskType: string;
  choices: string[];
  ratingMin: number | null;
  ratingMax: number | null;
  ratingMinLabel: string | null;
  ratingMaxLabel: string | null;
}

interface StructuredAnswer {
  type: string;
  value: string | number;
}

interface ResponseInfo {
  taskId: string;
  videoUrl: string | null;
  answerText: string | null;
  structuredAnswer: StructuredAnswer | null;
  structuredAnswerLockedAt: string | null;
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

// Read-only locked answer badge for Multiple Choice
function LockedMultipleChoiceAnswer({ value }: { value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
      <Lock className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">{t("tester.lockedAnswer")}</p>
        <p className="text-sm font-medium text-green-900">{value}</p>
      </div>
    </div>
  );
}

// Read-only locked answer for Rating Scale
function LockedRatingScaleAnswer({ value, task }: { value: number; task: Task }) {
  const min = task.ratingMin ?? 1;
  const max = task.ratingMax ?? 5;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
      <Lock className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">{t("tester.lockedRating")}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {task.ratingMinLabel && <span className="text-xs text-muted">{task.ratingMinLabel}</span>}
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
            <span
              key={n}
              className={[
                'h-9 w-9 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all',
                n === value
                  ? 'border-green-500 bg-green-500 text-white scale-110'
                  : 'border-border bg-surface text-muted'
              ].join(' ')}
            >
              {n}
            </span>
          ))}
          {task.ratingMaxLabel && <span className="text-xs text-muted">{task.ratingMaxLabel}</span>}
        </div>
        <p className="mt-2 text-xs text-green-700">{t("tester.selected")} <strong>{value}</strong> / {max}</p>
      </div>
    </div>
  );
}

export function ReviewJobView({ job, onBack, onSubmitted }: Props) {
  // For FREE_RESPONSE: editable markdown answers
  // For MC/RATING: optional additional comments only
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
    // For FREE_RESPONSE tasks, require markdown review
    const freeResponseTasks = job.campaign.tasks.filter(t => t.taskType === TaskType.FREE_RESPONSE);
    const missingFreeResponse = freeResponseTasks.some(t => !answers[t.id]?.trim());
    if (missingFreeResponse) {
      toast.error('Please provide a written review for all Free Response tasks.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        responses: job.campaign.tasks.map(t => ({
          taskId: t.id,
          answerText: answers[t.id] || ''
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

  const canSubmit = job.campaign.tasks
    .filter(t => t.taskType === TaskType.FREE_RESPONSE)
    .every(t => !!answers[t.id]?.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>&larr; Back</Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("tester.writeFinalReview")}</h2>
          <p className="text-sm text-muted">
            Watch your recorded videos and complete the review for each task.
          </p>
        </div>
      </div>

      {job.campaign.tasks.map((task, index) => {
        const response = job.responses?.find(r => r.taskId === task.id);
        const videoUrl = response?.videoUrl;
        const structuredAnswer = response?.structuredAnswer as StructuredAnswer | null;
        const isLocked = !!response?.structuredAnswerLockedAt;
        const isFreeResponse = task.taskType === TaskType.FREE_RESPONSE || !task.taskType;
        const isMultipleChoice = task.taskType === TaskType.MULTIPLE_CHOICE;
        const isRatingScale = task.taskType === TaskType.RATING_SCALE;

        return (
          <div key={task.id} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            {/* Task header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={[
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                isFreeResponse ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                isMultipleChoice ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
                'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              ].join(' ')}>
                {isFreeResponse ? '🎙️ Free Response' : isMultipleChoice ? '☑️ Multiple Choice' : '⭐ Rating Scale'}
              </span>
              <h3 className="font-semibold text-lg">Task {index + 1}</h3>
            </div>
            <p className="text-foreground mb-4 bg-muted/20 p-3 rounded-md border border-border">{task.instruction}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video player (left) */}
              <div>
                <h4 className="text-sm font-semibold mb-2">{t("tester.sessionVideo")}</h4>
                {videoUrl ? (
                  <video
                    src={process.env.NEXT_PUBLIC_API_URL + videoUrl}
                    controls
                    className="w-full rounded-md border border-border bg-black aspect-video object-contain"
                  />
                ) : (
                  <div className="flex aspect-video w-full flex-col p-4 text-center items-center justify-center rounded-md border border-border bg-muted/20 text-sm text-muted">
                    <p>{t("tester.noVideo")}</p>
                    {job.campaign.isLocked && <p className="text-xs text-red-500 mt-1">{t("tester.lockedCampaign")}</p>}
                  </div>
                )}
              </div>

              {/* Answer section (right) */}
              <div className="flex flex-col gap-3">
                {/* Locked structured answer (MC / Rating) */}
                {isMultipleChoice && isLocked && structuredAnswer?.type === 'MULTIPLE_CHOICE' && (
                  <LockedMultipleChoiceAnswer value={structuredAnswer.value as string} />
                )}
                {isRatingScale && isLocked && structuredAnswer?.type === 'RATING_SCALE' && (
                  <LockedRatingScaleAnswer value={structuredAnswer.value as number} task={task} />
                )}

                {/* Warning if structured answer expected but missing */}
                {(isMultipleChoice || isRatingScale) && !isLocked && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    ⚠️ No answer recorded yet. Please use the extension to answer this task while recording.
                  </div>
                )}

                {/* FREE_RESPONSE: required markdown review */}
                {isFreeResponse && (
                  <div className="flex flex-col flex-1">
                    <h4 className="text-sm font-semibold mb-2">
                      Your Review <span className="text-red-500">*</span>
                      <span className="font-normal text-muted ml-1">(Markdown supported)</span>
                    </h4>
                    <textarea
                      className="w-full flex-1 min-h-[150px] p-3 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      placeholder="e.g. **Findings:** I found the button easily, but..."
                      value={answers[task.id] || ''}
                      onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                    />
                    {answers[task.id] && (
                      <div className="mt-3 rounded-md border border-border bg-muted/20 p-4 text-sm prose dark:prose-invert prose-sm max-w-none">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t("tester.preview")}</p>
                        <ReactMarkdown>{answers[task.id]}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                {/* MC / Rating Scale: optional additional comment */}
                {(isMultipleChoice || isRatingScale) && (
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold mb-2 text-muted">
                      Additional Comments <span className="font-normal">(optional)</span>
                    </h4>
                    <textarea
                      className="w-full min-h-[100px] p-3 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Any extra thoughts about this task..."
                      value={answers[task.id] || ''}
                      onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                    />
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
          disabled={submitting || !canSubmit}
          className="px-8 py-2 font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Final Review to Owner'}
        </Button>
      </div>
    </div>
  );
}

