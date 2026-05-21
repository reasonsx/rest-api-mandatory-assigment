import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import * as userController from "./user.controller";

const router = Router();

router.get("/:userId", requireAuth, userController.getProfile);
router.patch("/:userId", requireAuth, userController.updateProfile);

export { router as userRouter };