"use strict";
// controllers/productController.ts
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
exports.getLastUpdated = exports.deleteProducts = exports.deleteProduct = exports.getTotalCount = exports.updateProducts = exports.updateProduct = exports.filterProducts = void 0;
exports.addProduct = addProduct;
exports.addProducts = addProducts;
exports.getProduct = getProduct;
exports.getProducts = getProducts;
const productService = __importStar(require("../services/product.service"));
const authService = __importStar(require("../services/auth.service"));
const mongoose_1 = require("mongoose");
const redisClient_1 = require("../config/redisClient");
const s3Helpers_1 = require("../utils/s3Helpers");
async function addProduct(req, res, next) {
    console.log("addProduct called");
    console.log(req.body);
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (user.role != "admin")
            return res.status(401).json({ error: "User not have this role" });
        // ✅ Upload images if present
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await (0, s3Helpers_1.uploadFilesToS3)(req.files);
        }
        // Parse JSON strings from FormData
        const parseJSON = (value) => {
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            }
            return value;
        };
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: parseJSON(req.body.category),
            sku: req.body.sku,
            brand: req.body.brand,
            material: req.body.material,
            stock: Number(req.body.stock),
            images: imageUrls,
            isActive: req.body.isActive === 'true',
            ageGroup: req.body.ageGroup,
            gender: req.body.gender,
            featured: req.body.featured === 'true',
            isNFT: req.body.isNFT === 'true',
            sizes: parseJSON(req.body.sizes),
            features: parseJSON(req.body.features),
            colors: parseJSON(req.body.colors),
            highlights: parseJSON(req.body.highlights),
            createdBy: new mongoose_1.Types.ObjectId(user._id),
        };
        // Add optional numeric fields
        if (req.body.originalPrice)
            productData.originalPrice = Number(req.body.originalPrice);
        if (req.body.discount)
            productData.discount = Number(req.body.discount);
        const product = await productService.addProduct(productData);
        // Clear Redis cache
        // try {
        //   const redisClient = await redisManager.getClient();
        //   const keys = await redisClient.keys("products:*");
        //   if (keys.length) await redisClient.del(keys);
        // } catch (redisError) {
        //   console.error("Error clearing Redis cache:", redisError);
        // }
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
}
async function addProducts(req, res, next) {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (user.role != "admin")
            return res.status(401).json({ error: "User not have this role" });
        // console.log("addProducts called",req.body);
        const productsInput = req.body.products || [];
        console.log("Products input:", productsInput);
        // Map files by product index
        const updatedProductsInput = await Promise.all(productsInput.map(async (p, index) => {
            return {
                ...p,
                createdBy: req.user?.id ? new mongoose_1.Types.ObjectId(req.user.id) : undefined,
            };
        }));
        // Clear Redis cache
        // try {
        //   const redisClient = await redisManager.getClient();
        //   const keys = await redisClient.keys("products:*");
        //   if (keys.length) await redisClient.del(keys);
        // } catch (redisError) {
        //   console.error("Error clearing Redis cache:", redisError);
        // }
        console.log(updatedProductsInput);
        const products = await productService.addProducts(updatedProductsInput);
        console.log("Products added:", products);
        res.status(201).json(products);
    }
    catch (error) {
        next(error);
    }
}
async function getProduct(req, res, next) {
    try {
        const { id } = req.params;
        const product = await productService.getProduct(id);
        res.json(product);
    }
    catch (err) {
        next(err);
    }
}
async function getProducts(req, res, next) {
    const { take, skip } = req.query;
    try {
        const cacheKey = `products:take=${take}:skip=${skip}`;
        let products;
        let etag;
        try {
            const redisClient = await redisClient_1.redisManager.getClient();
            // 1️⃣ Check Redis cache
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return res.json({ source: "cache", data: JSON.parse(cached) });
            }
            // 2️⃣ Fetch from DB
            products = await productService.getProducts(Number(take), Number(skip), false);
            etag = generateETag(products);
            const ifNoneMatch = req.headers["if-none-match"];
            if (ifNoneMatch === etag) {
                return res.status(304).send();
            }
            // 3️⃣ Store in cache for 1 hour
            await redisClient.setex(cacheKey, 3600, JSON.stringify(products));
        }
        catch (redisError) {
            console.error("Redis error:", redisError);
            // If Redis fails, just get from DB
            products = await productService.getProducts(Number(take), Number(skip), false);
        }
        res.set("ETag", etag);
        res.json({ source: "db", data: products });
    }
    catch (error) {
        next(error);
    }
}
const filterProducts = async (req, res, next) => {
    try {
        const { category, ageGroup, sku, gender, brand, price, stock, createdAt, isActive, take, skip, sortBy, sortOrder, featured, isNFT, sizes } = req.body;
        // ✅ Build cache key safely (ignore undefined/null)
        const filters = { category, ageGroup, sku, gender, brand, price, stock, createdAt, isActive, take, skip, sortBy, sortOrder, featured, isNFT, sizes };
        const cacheKey = `products:filter:${JSON.stringify(filters)}`;
        let products, total;
        let etag;
        try {
            // const redisClient = await redisManager.getClient();
            // // 1️⃣ Try cache
            // const cached = await redisClient.get(cacheKey);
            // if (cached) {
            //   const parsed = JSON.parse(cached);
            //   return res.json({ source: "cache", ...parsed });
            // }
            // 2️⃣ Fetch from DB if not in cache
            [products, total] = await productService.filterProducts({
                category, ageGroup, gender, brand, price, stock,
                createdAt, isActive, take, skip, sortBy, sortOrder, featured
            });
            etag = generateETag(products);
            const ifNoneMatch = req.headers["if-none-match"];
            if (ifNoneMatch === etag) {
                return res.status(304).send();
            }
            // 3️⃣ Store in cache for 1 hour
            // await redisClient.setex(cacheKey, 3600, JSON.stringify({products, total}));
        }
        catch (redisError) {
            console.error("Redis error:", redisError);
            // If Redis fails, just get from DB
            [products, total] = await productService.filterProducts({
                category, ageGroup, gender, brand, price, stock,
                createdAt, isActive, take, skip, sortBy, sortOrder, featured
            });
        }
        res.set("ETag", etag);
        res.json({
            source: "db",
            data: products,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.filterProducts = filterProducts;
const updateProduct = async (req, res, next) => {
    try {
        console.log(req.params, "xxxxx");
        const { id } = req.params;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role != "admin") {
            return res.status(401).json({ error: "User not have this role" });
        }
        console.log(req.body);
        const { name, description, price, category, sku, brand, stock, images, isActive, featured } = req.body;
        const product = await productService.updateProduct(id, { name, description, price, category, sku, brand, stock, images, isActive, featured });
        res.json(product);
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
const updateProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role != "admin") {
            return res.status(401).json({ error: "User not have this role" });
        }
        const { name, description, sku, price, category, brand, stock, images, isActive, featured } = req.body;
        const products = await productService.updateProducts(ids, { name, description, sku, price, category, brand, stock, images, isActive, featured });
        res.json(products);
    }
    catch (err) {
        next(err);
    }
};
exports.updateProducts = updateProducts;
const getTotalCount = async (req, res, next) => {
    try {
        const count = await productService.getTotalCount();
        res.json(count);
    }
    catch (err) {
        next(err);
    }
};
exports.getTotalCount = getTotalCount;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role != "admin") {
            return res.status(401).json({ error: "User not have this role" });
        }
        const product = await productService.deleteProduct(id);
        res.json(product);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;
const deleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        console.log(ids);
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role != "admin") {
            return res.status(401).json({ error: "User not have this role" });
        }
        const products = await productService.deleteProducts(ids);
        res.json(products);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProducts = deleteProducts;
const getLastUpdated = async (req, res, next) => {
    try {
        const lastUpdated = await productService.getLastUpdated();
        res.json(lastUpdated);
    }
    catch (err) {
        next(err);
    }
};
exports.getLastUpdated = getLastUpdated;
function generateETag(data) {
    const crypto = require('crypto');
    const json = JSON.stringify(data || {});
    return crypto.createHash('md5').update(json).digest('hex');
}
