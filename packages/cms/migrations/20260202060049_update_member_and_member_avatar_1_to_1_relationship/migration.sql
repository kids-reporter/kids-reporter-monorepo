/*
  Warnings:

  - You are about to drop the column `member` on the `MemberAvatar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatar]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MemberAvatar" DROP CONSTRAINT "MemberAvatar_member_fkey";

-- DropIndex
DROP INDEX "Member_avatar_idx";

-- DropIndex
DROP INDEX "MemberAvatar_member_idx";

-- AlterTable
ALTER TABLE "MemberAvatar" DROP COLUMN "member";

-- CreateIndex
CREATE UNIQUE INDEX "Member_avatar_key" ON "Member"("avatar");
