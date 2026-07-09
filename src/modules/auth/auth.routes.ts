import { Router } from "express";
import protectedRoutes from "./auth.protected";
import { login } from "./auth.controller";

const router = Router();

router.post(

    "/admin/login",

    login

);
router.use(protectedRoutes);
export default router;