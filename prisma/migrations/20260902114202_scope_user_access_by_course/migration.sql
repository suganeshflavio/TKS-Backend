-- DropIndex
DROP INDEX "UserAccess_userId_videoId_key";

-- DropIndex
DROP INDEX "UserMcqTestAccess_userId_testId_key";

-- DropIndex
DROP INDEX "UserNotesAccess_userId_notesId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserAccess_userId_courseId_videoId_key" ON "UserAccess"("userId", "courseId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMcqTestAccess_userId_courseId_testId_key" ON "UserMcqTestAccess"("userId", "courseId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotesAccess_userId_courseId_notesId_key" ON "UserNotesAccess"("userId", "courseId", "notesId");
