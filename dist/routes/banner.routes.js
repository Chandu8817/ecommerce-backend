"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const banner_controller_1 = require("../controllers/banner.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Validation middleware
const validateBannerId = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid banner ID")
];
const validateBannerInput = [
    (0, express_validator_1.body)("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 100 }).withMessage("Title must be less than 100 characters"),
    (0, express_validator_1.body)("subtitle")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Subtitle must be less than 200 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),
    (0, express_validator_1.body)("imageUrl")
        .trim()
        .notEmpty().withMessage("Image URL is required")
        .isURL().withMessage("Invalid image URL"),
    (0, express_validator_1.body)("mobileImageUrl")
        .optional()
        .trim()
        .isURL().withMessage("Invalid mobile image URL"),
    (0, express_validator_1.body)("linkUrl")
        .optional()
        .trim(),
    (0, express_validator_1.body)("buttonText")
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage("Button text must be less than 50 characters"),
    (0, express_validator_1.body)("startDate")
        .optional()
        .isISO8601().withMessage("Invalid start date format. Use ISO8601 format"),
    (0, express_validator_1.body)("endDate")
        .optional()
        .isISO8601().withMessage("Invalid end date format. Use ISO8601 format")
        .custom((value, { req }) => {
        if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
            throw new Error("End date must be after start date");
        }
        return true;
    }),
    (0, express_validator_1.body)("priority")
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage("Priority must be between 0 and 100"),
    (0, express_validator_1.body)("tags")
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
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean")
];
// Public routes
router.get("/", [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    (0, express_validator_1.query)("isActive").optional().isBoolean(),
    (0, express_validator_1.query)("tags").optional().isString(),
    (0, express_validator_1.query)("startDate").optional().isISO8601(),
    (0, express_validator_1.query)("endDate").optional().isISO8601()
], banner_controller_1.getBanners);
// Get active banners for public access (no auth required)
router.get("/active", [
    (0, express_validator_1.query)("tags").optional().isString()
], banner_controller_1.getActiveBanners);
// Get banner by ID (public)
router.get("/:id", validateBannerId, banner_controller_1.getBannerById);
// Protected routes (admin only)
router.post("/", [
    auth_1.authMiddleware,
    ...validateBannerInput,
    banner_controller_1.validateBanner
], banner_controller_1.createBanner);
router.put("/:id", [
    auth_1.authMiddleware,
    ...validateBannerId,
    ...validateBannerInput,
    banner_controller_1.validateBanner
], banner_controller_1.updateBanner);
router.delete("/:id", [
    auth_1.authMiddleware,
    ...validateBannerId
], banner_controller_1.deleteBanner);
router.patch("/:id/status", [
    auth_1.authMiddleware,
    ...validateBannerId,
    (0, express_validator_1.body)("isActive").isBoolean().withMessage("isActive is required and must be a boolean")
], banner_controller_1.toggleBannerStatus);
exports.default = router;
