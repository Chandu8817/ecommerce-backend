import express from "express";
import { deleteImages, getImages, uploadImage, uploadMultipleImages } from "../controllers/uploadController";



const router = express.Router();

router.post("", uploadImage);
router.post("/multiple", uploadMultipleImages);
router.get("/images", getImages);
router.delete("/images/", deleteImages);



export default router;
