import { Router } from "express";
import { getProduct,getProducts,addProduct, filterProducts,addProducts,updateProduct,getTotalCount,deleteProduct,deleteProducts, updateProducts } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../middlewares/upload";


const router =Router()

router.post("/",authMiddleware,upload.array("images",5),addProduct);
router.post("/bulk",authMiddleware,upload.array("images",5),addProducts);
router.get("/",getProducts);
router.get("/total-count",getTotalCount);
router.get("/:id",getProduct);
router.post("/filter", filterProducts);
router.put("/:id",authMiddleware,updateProduct);
router.put("/",authMiddleware,updateProducts);
router.delete("/:id",authMiddleware,deleteProduct);
router.delete("/",authMiddleware,deleteProducts);



export default router;
