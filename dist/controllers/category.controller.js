"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryByName = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const categoryService = __importStar(require("../services/category.service"));
const createCategory = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const category = await categoryService.createCategory(req.body, req.user.id);
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
const getCategoryByName = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryByName(req.params.name);
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryByName = getCategoryByName;
const updateCategory = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const category = await categoryService.updateCategory(req.params.id, req.body, req.user.id);
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const category = await categoryService.deleteCategory(req.params.id, req.user.id);
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
