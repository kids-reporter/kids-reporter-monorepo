/*
  Warnings:

  - You are about to drop the column `essayQuestionsJSON` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `multipleChoiceQuestionsJSON` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `CallBaodaozai` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "essayQuestionsJSON",
DROP COLUMN "multipleChoiceQuestionsJSON";

-- DropTable
DROP TABLE "CallBaodaozai";
