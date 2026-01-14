import { Router } from "express";
import { getProduct,getProducts,addProduct, filterProducts,addProducts,updateProduct,getTotalCount,deleteProduct,deleteProducts, updateProducts,getLastUpdated } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth";
import { s3Multiple } from "../middlewares/s3Upload";


const router =Router()

router.post("/",authMiddleware,s3Multiple,addProduct);
router.post("/bulk",authMiddleware,addProducts);
router.get("/",getProducts);
router.get("/total-count",getTotalCount);
router.get("/:id",getProduct);
router.get("/last-updated",getLastUpdated);
router.post("/filter", filterProducts);

router.put("/:id",authMiddleware,updateProduct);
router.put("/",authMiddleware,updateProducts);
router.delete("/:id",authMiddleware,deleteProduct);
router.delete("/",authMiddleware,deleteProducts);




export default router;
