import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { uploadImage } from "../../middleware/upload.middleware";
import { uploadInlineImage } from "./upload.controller";

const router = Router();

router.post("/image", authenticate, isAdmin, uploadImage.single("file"), uploadInlineImage);

export default router;
