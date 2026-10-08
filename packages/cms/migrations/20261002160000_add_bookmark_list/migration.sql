-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "post" INTEGER,
    "project" INTEGER,
    "member" TEXT,
    "compositeKey" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_compositeKey_key" ON "Bookmark"("compositeKey");

-- CreateIndex
CREATE INDEX "Bookmark_type_idx" ON "Bookmark"("type");

-- CreateIndex
CREATE INDEX "Bookmark_post_idx" ON "Bookmark"("post");

-- CreateIndex
CREATE INDEX "Bookmark_project_idx" ON "Bookmark"("project");

-- CreateIndex
CREATE INDEX "Bookmark_member_idx" ON "Bookmark"("member");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_post_fkey" FOREIGN KEY ("post") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_project_fkey" FOREIGN KEY ("project") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
