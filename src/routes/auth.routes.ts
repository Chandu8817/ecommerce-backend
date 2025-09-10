import { Router } from "express";
import { register, login,getAuthUser } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router()

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware,getAuthUser);

export default router;