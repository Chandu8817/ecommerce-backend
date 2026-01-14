"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
router.post("", uploadController_1.uploadImage);
router.post("/multiple", uploadController_1.uploadMultipleImages);
router.get("/images", uploadController_1.getImages);
router.delete("/images/", uploadController_1.deleteImages);
exports.default = router;
