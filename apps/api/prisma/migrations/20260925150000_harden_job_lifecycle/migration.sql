-- Add lifecycle timestamps
ALTER TABLE "JobAssignment"
ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "submittedAt" TIMESTAMP(3),
ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- Enforce stable task ordering within a campaign
CREATE UNIQUE INDEX "Task_campaignId_stepOrder_key"
ON "Task"("campaignId", "stepOrder");

-- Enforce one response per task per job
CREATE UNIQUE INDEX "TaskResponse_jobId_taskId_key"
ON "TaskResponse"("jobId", "taskId");
