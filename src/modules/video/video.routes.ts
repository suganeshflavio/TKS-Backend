import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

import {
  createVideo,
  getVideoById,
  getVideos,
  updateVideo,
} from "./video.controller";

const router = Router();

// router.post("/", authenticate, isAdmin, createVideo);

router.get(
  "/",

  authenticate,

  isAdmin,

  getVideos,
);

router.put(
  "/:id",

  authenticate,

  isAdmin,

  updateVideo,
);

router.post(
    "/",
    authenticate,
    isAdmin,
    upload.single("notesUrl"),
    createVideo
);

router.get("/:id", authenticate, isAdmin, getVideoById);

export default router;
