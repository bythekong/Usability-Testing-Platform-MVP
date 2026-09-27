-- AlterTable
ALTER TABLE "TestCampaign" ADD COLUMN     "targetGenders" TEXT[],
ADD COLUMN     "targetItExpertises" TEXT[],
ADD COLUMN     "targetMaxAge" INTEGER,
ADD COLUMN     "targetMinAge" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "itExpertise" TEXT,
ADD COLUMN     "occupation" TEXT;
