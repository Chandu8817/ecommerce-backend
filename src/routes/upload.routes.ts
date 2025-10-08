// routes/uploadRoutes.ts
import express from "express";
import  {upload}  from "../middlewares/upload";
import { uploadImages } from "../controllers/uploadController";

const router = express.Router();

router.post("/images", upload.array("images", 10), uploadImages);

export default router;
