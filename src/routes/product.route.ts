import { Router } from "express";
import { getProduct,getProducts,addProduct, filterProducts,addProducts,updateProduct } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth";


const router =Router()

router.post("/",authMiddleware,addProduct);
router.post("/bulk",authMiddleware,addProducts);
router.get("/",getProducts);
router.get("/:id",getProduct);
router.post("/filter", filterProducts);
router.put("/:id",authMiddleware,updateProduct);



export default router;
