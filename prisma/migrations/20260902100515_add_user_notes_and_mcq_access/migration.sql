-- CreateTable
CREATE TABLE "UserNotesAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "notesId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNotesAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMcqTestAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMcqTestAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserNotesAccess_userId_idx" ON "UserNotesAccess"("userId");

-- CreateIndex
CREATE INDEX "UserNotesAccess_courseId_idx" ON "UserNotesAccess"("courseId");

-- CreateIndex
CREATE INDEX "UserNotesAccess_notesId_idx" ON "UserNotesAccess"("notesId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotesAccess_userId_notesId_key" ON "UserNotesAccess"("userId", "notesId");

-- CreateIndex
CREATE INDEX "UserMcqTestAccess_userId_idx" ON "UserMcqTestAccess"("userId");

-- CreateIndex
CREATE INDEX "UserMcqTestAccess_courseId_idx" ON "UserMcqTestAccess"("courseId");

-- CreateIndex
CREATE INDEX "UserMcqTestAccess_testId_idx" ON "UserMcqTestAccess"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMcqTestAccess_userId_testId_key" ON "UserMcqTestAccess"("userId", "testId");

-- AddForeignKey
ALTER TABLE "UserNotesAccess" ADD CONSTRAINT "UserNotesAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotesAccess" ADD CONSTRAINT "UserNotesAccess_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotesAccess" ADD CONSTRAINT "UserNotesAccess_notesId_fkey" FOREIGN KEY ("notesId") REFERENCES "Notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMcqTestAccess" ADD CONSTRAINT "UserMcqTestAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMcqTestAccess" ADD CONSTRAINT "UserMcqTestAccess_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMcqTestAccess" ADD CONSTRAINT "UserMcqTestAccess_testId_fkey" FOREIGN KEY ("testId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
