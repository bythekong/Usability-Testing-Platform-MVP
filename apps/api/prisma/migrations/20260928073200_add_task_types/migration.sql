-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "choices" TEXT[],
ADD COLUMN     "ratingMax" INTEGER,
ADD COLUMN     "ratingMaxLabel" TEXT,
ADD COLUMN     "ratingMin" INTEGER,
ADD COLUMN     "ratingMinLabel" TEXT,
ADD COLUMN     "taskType" TEXT NOT NULL DEFAULT 'FREE_RESPONSE';

-- AlterTable
ALTER TABLE "TaskResponse" ADD COLUMN     "structuredAnswer" JSONB,
ADD COLUMN     "structuredAnswerLockedAt" TIMESTAMP(3);
