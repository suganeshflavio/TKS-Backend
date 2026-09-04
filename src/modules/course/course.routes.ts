import { Router } from "express";

import {
    createCourse,
    getCourseById,
    getCourses,
    updateCourse,
    deleteCourse,
    permanentDeleteCourse,
    linkCourseSubject,
    unlinkCourseSubject,
    linkCourseVideo,
    unlinkCourseVideo,
    linkCourseNotes,
    unlinkCourseNotes,
    linkCourseMcqTest,
    unlinkCourseMcqTest
} from "./course.controller";

import { authenticate } from "../../middleware/auth.middleware";

import { isAdmin } from "../../middleware/admin.middleware";

const router = Router();

router.post(

    "/",

    authenticate,

    isAdmin,

    createCourse

);

router.get(
    "/",
    authenticate,
    isAdmin,
    getCourses
);

router.get(

    "/:id",

    authenticate,

    isAdmin,

    getCourseById

);

router.put(

    "/:id",

    authenticate,

    isAdmin,

    updateCourse

);

router.delete("/:id", authenticate, isAdmin, deleteCourse);

router.delete("/:id/permanent", authenticate, isAdmin, permanentDeleteCourse);

router.post("/:id/subjects", authenticate, isAdmin, linkCourseSubject);
router.delete("/:id/subjects/:subjectId", authenticate, isAdmin, unlinkCourseSubject);

router.post("/:id/videos", authenticate, isAdmin, linkCourseVideo);
router.delete("/:id/videos/:videoId", authenticate, isAdmin, unlinkCourseVideo);

router.post("/:id/notes", authenticate, isAdmin, linkCourseNotes);
router.delete("/:id/notes/:notesId", authenticate, isAdmin, unlinkCourseNotes);

router.post("/:id/mcq-tests", authenticate, isAdmin, linkCourseMcqTest);
router.delete("/:id/mcq-tests/:testId", authenticate, isAdmin, unlinkCourseMcqTest);

export default router;
