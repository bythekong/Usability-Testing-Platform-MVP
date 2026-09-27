-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "maxTimeLimit" INTEGER NOT NULL DEFAULT 300;

-- AlterTable
ALTER TABLE "TaskResponse" ADD COLUMN     "videoUrl" TEXT;
