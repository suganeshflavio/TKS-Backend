import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = Router();

router.get(
    "/me",
    authenticate,
    isAdmin,
    (req, res) => {

        res.json({
            success: true,
            user: req.user
        });

    }
);

export default router;