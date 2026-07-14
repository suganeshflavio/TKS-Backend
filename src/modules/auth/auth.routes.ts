import { Router } from "express";
import protectedRoutes from "./auth.protected";
import { adminLoginController, logoutController, studentLoginController } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(

    "/admin/login",

    adminLoginController

);

router.post(
    "/login",
    studentLoginController
);

router.post(
    "/logout",
    authenticate,
    logoutController
);

router.use(protectedRoutes);
export default router;