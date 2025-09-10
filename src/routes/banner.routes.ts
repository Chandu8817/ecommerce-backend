import { Router } from "express";
import { getBanners, createBanner, deleteBanner, getActiveBanners,getBannerById,toggleBannerStatus } from "../controllers/banner.controller";
import { authMiddleware } from "../middleware/auth";
const router =Router()
router.post("/",authMiddleware,createBanner);
router.get("/",getBanners);
router.delete("/:id",authMiddleware,deleteBanner);
router.get("/active",getActiveBanners);
router.get("/:id",getBannerById);
router.patch("/:id/toggle",authMiddleware,toggleBannerStatus);

export default router;