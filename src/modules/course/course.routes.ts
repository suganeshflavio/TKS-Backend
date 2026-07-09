import { Router } from "express";

import { createCourse, getCourseById, getCourses, updateCourse } from "./course.controller";

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

export default router;