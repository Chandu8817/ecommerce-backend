import { Router } from "express";
import { body, param, query } from "express-validator";
import { 
    createBanner, 
    deleteBanner, 
    getBannerById, 
    getBanners, 
    toggleBannerStatus, 
    updateBanner,
    getActiveBanners,
    validateBanner
} from "../controllers/banner.controller";
import { authMiddleware } from "../middlewares/auth";


const router = Router();

// Validation middleware
const validateBannerId = [
    param("id").isMongoId().withMessage("Invalid banner ID")
];

const validateBannerInput = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 100 }).withMessage("Title must be less than 100 characters"),
    body("subtitle")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Subtitle must be less than 200 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),
    body("imageUrl")
        .trim()
        .notEmpty().withMessage("Image URL is required")
        .isURL().withMessage("Invalid image URL"),
    body("mobileImageUrl")
        .optional()
        .trim()
        .isURL().withMessage("Invalid mobile image URL"),
    body("linkUrl")
        .optional()
        .trim(),
    body("buttonText")
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage("Button text must be less than 50 characters"),
   body("startDate")
        .optional()
        .isISO8601().withMessage("Invalid start date format. Use ISO8601 format"),
    body("endDate")
        .optional()
        .isISO8601().withMessage("Invalid end date format. Use ISO8601 format")
        .custom((value, { req }) => {
            if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("End date must be after start date");
            }
            return true;
        }),
    body("priority")
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage("Priority must be between 0 and 100"),
    body("tags")
        .optional()
        .isArray().withMessage("Tags must be an array")
        .custom((tags) => {
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    if (typeof tag !== "string" || tag.length > 50) {
                        throw new Error("Each tag must be a string with max 50 characters");
                    }
                }
            }
            return true;
        }),
    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean")
];

// Public routes
router.get("/", [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("isActive").optional().isBoolean(),
    query("tags").optional().isString(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601()
], getBanners);

// Get active banners for public access (no auth required)
router.get("/active", [
    query("tags").optional().isString()
], getActiveBanners);

// Get banner by ID (public)
router.get("/:id", validateBannerId, getBannerById);

// Protected routes (admin only)
router.post("/", [
    authMiddleware,
    ...validateBannerInput,
    validateBanner
], createBanner);

router.put("/:id", [
    authMiddleware,
    ...validateBannerId,
    ...validateBannerInput,
    validateBanner
], updateBanner);

router.delete("/:id", [
    authMiddleware,
    ...validateBannerId
], deleteBanner);

router.patch("/:id/status", [
    authMiddleware,
    ...validateBannerId,
    body("isActive").isBoolean().withMessage("isActive is required and must be a boolean")
], toggleBannerStatus);

export default router;