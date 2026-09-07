-- DropIndex
DROP INDEX "CourseSubject_courseId_subjectId_key";

-- AlterTable
ALTER TABLE "CourseSubject" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE INDEX "CourseSubject_classId_idx" ON "CourseSubject"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSubject_courseId_subjectId_classId_key" ON "CourseSubject"("courseId", "subjectId", "classId");

-- AddForeignKey
ALTER TABLE "CourseSubject" ADD CONSTRAINT "CourseSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
