-- DropIndex
DROP INDEX "CourseMcqTest_courseId_testId_key";

-- DropIndex
DROP INDEX "CourseNotes_courseId_notesId_key";

-- DropIndex
DROP INDEX "CourseVideo_courseId_videoId_key";

-- AlterTable
ALTER TABLE "CourseMcqTest" ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "CourseNotes" ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "CourseVideo" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE INDEX "CourseMcqTest_classId_idx" ON "CourseMcqTest"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMcqTest_courseId_testId_classId_key" ON "CourseMcqTest"("courseId", "testId", "classId");

-- CreateIndex
CREATE INDEX "CourseNotes_classId_idx" ON "CourseNotes"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseNotes_courseId_notesId_classId_key" ON "CourseNotes"("courseId", "notesId", "classId");

-- CreateIndex
CREATE INDEX "CourseVideo_classId_idx" ON "CourseVideo"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseVideo_courseId_videoId_classId_key" ON "CourseVideo"("courseId", "videoId", "classId");

-- AddForeignKey
ALTER TABLE "CourseVideo" ADD CONSTRAINT "CourseVideo_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseNotes" ADD CONSTRAINT "CourseNotes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMcqTest" ADD CONSTRAINT "CourseMcqTest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
