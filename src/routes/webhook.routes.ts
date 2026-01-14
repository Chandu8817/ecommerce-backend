
import express from "express";
import { shiprocketWebhook } from "../controllers/webhook.controller";
const router = express.Router();

router.post("/shiprocket", shiprocketWebhook);

export default router;