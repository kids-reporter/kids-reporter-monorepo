-- CreateTable
CREATE TABLE "BrowsingHistory" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "post" INTEGER,
    "project" INTEGER,
    "member" TEXT,
    "compositeKey" TEXT,
    "visitedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BrowsingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrowsingHistory_compositeKey_key" ON "BrowsingHistory"("compositeKey");

-- CreateIndex
CREATE INDEX "BrowsingHistory_type_idx" ON "BrowsingHistory"("type");

-- CreateIndex
CREATE INDEX "BrowsingHistory_post_idx" ON "BrowsingHistory"("post");

-- CreateIndex
CREATE INDEX "BrowsingHistory_project_idx" ON "BrowsingHistory"("project");

-- CreateIndex
CREATE INDEX "BrowsingHistory_member_idx" ON "BrowsingHistory"("member");

-- CreateIndex
CREATE INDEX "BrowsingHistory_visitedAt_idx" ON "BrowsingHistory"("visitedAt");

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_post_fkey" FOREIGN KEY ("post") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_project_fkey" FOREIGN KEY ("project") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
