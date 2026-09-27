-- AlterTable
ALTER TABLE "TestCampaign" ADD COLUMN     "scenario" TEXT,
ADD COLUMN     "testerCount" INTEGER NOT NULL DEFAULT 1;
