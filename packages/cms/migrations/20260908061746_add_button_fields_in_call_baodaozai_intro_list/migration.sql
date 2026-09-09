-- CreateEnum
CREATE TYPE "CallBaodaozaiIntroButtonStatusType" AS ENUM ('hidden', 'custom', 'showIntro');

-- AlterTable
ALTER TABLE "CallBaodaozaiIntro" ADD COLUMN     "buttonStatus" "CallBaodaozaiIntroButtonStatusType" NOT NULL DEFAULT 'showIntro',
ADD COLUMN     "buttonText" TEXT NOT NULL DEFAULT '開始介紹',
ADD COLUMN     "buttonUrl" TEXT NOT NULL DEFAULT '';
