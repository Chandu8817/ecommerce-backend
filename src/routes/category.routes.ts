import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, getCategoryByName, updateCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth";
const router = Router()
router.post("/",authMiddleware,createCategory);
router.get("/",getAllCategories);
router.get("/:id",getCategoryById);
router.get("/:name",getCategoryByName);
router.put("/:id",authMiddleware,updateCategory);
router.delete("/:id",authMiddleware,deleteCategory);
export default router;
