import express from "express";
import { getImage } from "../controllers/uploadController";
const router = express.Router();
router.get("/:key", getImage);
console.log("Image route mounted at /images");
export default router;