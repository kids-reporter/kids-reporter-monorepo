/*
  Warnings:

  - You are about to drop the column `order` on the `PopularKeyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EditorPicksSetting" ADD COLUMN     "popularKeywordsOrderJson" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "PopularKeyword" DROP COLUMN "order";

-- CreateTable
CREATE TABLE "_EditorPicksSetting_popularKeywords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EditorPicksSetting_popularKeywords_AB_unique" ON "_EditorPicksSetting_popularKeywords"("A", "B");

-- CreateIndex
CREATE INDEX "_EditorPicksSetting_popularKeywords_B_index" ON "_EditorPicksSetting_popularKeywords"("B");

-- AddForeignKey
ALTER TABLE "_EditorPicksSetting_popularKeywords" ADD CONSTRAINT "_EditorPicksSetting_popularKeywords_A_fkey" FOREIGN KEY ("A") REFERENCES "EditorPicksSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditorPicksSetting_popularKeywords" ADD CONSTRAINT "_EditorPicksSetting_popularKeywords_B_fkey" FOREIGN KEY ("B") REFERENCES "PopularKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
