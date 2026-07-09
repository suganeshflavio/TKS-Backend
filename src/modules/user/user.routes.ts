import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";

import { isAdmin } from "../../middleware/admin.middleware";

import {

    createStudent,
    getUserById,
    getUsers

} from "./user.controller";

const router = Router();

router.post(

    "/",

    authenticate,

    isAdmin,

    createStudent

);

router.get(
    "/",
    authenticate,
    isAdmin,
    getUsers
);

router.get(
    "/:id",
    authenticate,
    isAdmin,
    getUserById
);

export default router;