import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { protect, requireRole } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", protect, requireRole("admin"), register);
router.get("/me", protect, me);

export default router;
