// controllers/productController.ts

import { Response, Request, NextFunction } from "express";
import * as productService from "../services/product.service";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth";
import { IProduct } from "../models/Product";
import { Types } from "mongoose";
import { redisManager } from '../config/redisClient';
import { uploadFilesToS3 } from "../utils/s3Helpers";

export async function addProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
console.log("addProduct called");
console.log(req.body);
  const { name, description, price, category,sku, brand, stock, isActive,isNFT,sizes } = req.body;
  console.log(name,description
  );
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role != "admin") return res.status(401).json({ error: "User not have this role" });

    // ✅ Upload images if present
    let imageUrls: string[] = [];
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      imageUrls = await uploadFilesToS3(req.files as Express.Multer.File[]);
    }

    const product = await productService.addProduct({
      name,
      description,
      price,
      category,
      sku,
      brand,
      stock,
      images: imageUrls,
      isActive,
      isNFT: isNFT,
      sizes: sizes,
      createdBy: new Types.ObjectId(user._id),
    });

    // Clear Redis cache
    // try {
    //   const redisClient = await redisManager.getClient();
    //   const keys = await redisClient.keys("products:*");
    //   if (keys.length) await redisClient.del(keys);
    // } catch (redisError) {
    //   console.error("Error clearing Redis cache:", redisError);
    // }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function addProducts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role != "admin") return res.status(401).json({ error: "User not have this role" });
    // console.log("addProducts called",req.body);
    const productsInput: Partial<IProduct>[] = req.body.products || [];
    console.log("Products input:", productsInput);

    // Map files by product index
 

    const updatedProductsInput: Partial<IProduct>[] = await Promise.all(
      productsInput.map(async (p, index) => {
     
   

        return {
          ...p,
          createdBy: req.user?.id ? new Types.ObjectId(req.user.id) : undefined,
        };
      })
    );

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
  } catch (error) {
    next(error);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const product = await productService.getProduct(id);

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { take, skip } = req.query
  try {

     const cacheKey = `products:take=${take}:skip=${skip}`;
    let products;

  
let etag;
    try {
      const redisClient = await redisManager.getClient();
      
      // 1️⃣ Check Redis cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json({ source: "cache", data: JSON.parse(cached) });
      }

      // 2️⃣ Fetch from DB
      products = await productService.getProducts(Number(take), Number(skip),false);
         etag = generateETag(products);
    const ifNoneMatch = req.headers["if-none-match"];

    if (ifNoneMatch === etag) {
      return res.status(304).send();
    }

      // 3️⃣ Store in cache for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(products));
    } catch (redisError) {
      console.error("Redis error:", redisError);
      // If Redis fails, just get from DB
      products = await productService.getProducts(Number(take), Number(skip),false);
    }

    res.set("ETag", etag);
    res.json({ source: "db", data: products });
  } catch (error) {
    next(error);
  }
}

export const filterProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category,ageGroup,sku, gender, brand, price, stock, createdAt, isActive, take, skip,sortBy,sortOrder,featured,isNFT, sizes } = req.body;

    // ✅ Build cache key safely (ignore undefined/null)
    const filters = { category,ageGroup,sku,gender, brand, price, stock, createdAt, isActive, take, skip,sortBy,sortOrder,featured,isNFT, sizes };
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
        createdAt, isActive, take, skip, sortBy, sortOrder ,featured
      });

         etag = generateETag(products);
    const ifNoneMatch = req.headers["if-none-match"];

    if (ifNoneMatch === etag) {
      return res.status(304).send();
    }
      
      // 3️⃣ Store in cache for 1 hour
      // await redisClient.setex(cacheKey, 3600, JSON.stringify({products, total}));
    } catch (redisError) {
      console.error("Redis error:", redisError);
      // If Redis fails, just get from DB
      [products, total] = await productService.filterProducts({ 
        category, ageGroup, gender, brand, price, stock, 
        createdAt, isActive, take, skip, sortBy, sortOrder,featured
      });
    }
    res.set("ETag", etag);
    res.json({
      source: "db",
      data: products,
     
    });

  } catch (err) {
    next(err);
  }
};


export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log(req.params,"xxxxx");
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    console.log(req.body);
    const { name, description, price, category,sku, brand, stock, images, isActive,featured } = req.body;
    const product = await productService.updateProduct(id, { name, description, price, category,sku, brand, stock, images, isActive,featured });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    const { name, description,sku, price, category, brand, stock, images, isActive,featured } = req.body;
    const products = await productService.updateProducts(ids, { name, description,sku, price, category, brand, stock, images, isActive,featured });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getTotalCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await productService.getTotalCount();
    res.json(count);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    const product = await productService.deleteProduct(id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const  {ids}  = req.body;
    console.log(ids);
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    const products = await productService.deleteProducts(ids);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getLastUpdated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lastUpdated = await productService.getLastUpdated();
    res.json(lastUpdated);
  } catch (err) {
    next(err);
  }
};

function generateETag(data: any) {
  const crypto = require('crypto');
  const json = JSON.stringify(data || {});
  return crypto.createHash('md5').update(json).digest('hex');
}