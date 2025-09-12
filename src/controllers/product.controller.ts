// controllers/productController.ts

import { Response, Request, NextFunction } from "express";
import * as productService from "../services/product.service";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";
import { IProduct } from "../models/Product";
import { Types } from "mongoose";
import {redis} from "../config/redisClient";

export async function addProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const {
    name,
    description,
    price,
    category,
    brand,
    stock,
    images,
    isActive,
  } = req.body;

  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }

    const product = await productService.addProduct({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      isActive,
      createdBy: user._id,
    });
    const keys = await redis.keys("products:*");
if (keys.length) {
  await redis.del(keys);
}
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
  const productsInput: Partial<IProduct>[] = req.body;
  const updatedProductsInput: Partial<IProduct>[] = productsInput.map((p) => ({
  ...p,
    createdBy: req.user?.id ? new Types.ObjectId(req.user.id) : undefined,
}));

  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    const keys = await redis.keys("products:*");
if (keys.length) {
  await redis.del(keys);
}
    const products = await productService.addProducts(updatedProductsInput);

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

    // 1️⃣ Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ source: "cache", data: JSON.parse(cached) });
    }

    // 2️⃣ Fetch from DB
    const products = await productService.getProducts(Number(take), Number(skip));

    // 3️⃣ Store in cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(products));

    res.json({ source: "db", data: products });
  } catch (error) {
    next(error);
  }
}

export const filterProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category,ageGroup, gender, brand, price, stock, createdAt, isActive, take, skip,sortBy,sortOrder } = req.body;

    // ✅ Build cache key safely (ignore undefined/null)
    const filters = { category,ageGroup,gender, brand, price, stock, createdAt, isActive, take, skip,sortBy,sortOrder };
    const cacheKey = `products:filter:${JSON.stringify(filters)}`;

    // 1️⃣ Try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({ source: "cache", ...parsed });
    }
    const [products, total]:any = await productService.filterProducts({ category,ageGroup,gender, brand, price, stock, createdAt, isActive, take, skip,sortBy,sortOrder })
    console.log(products);
    console.log(total);
    
    await redis.setex(cacheKey, 3600, JSON.stringify({products}));
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
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role != "admin") {
      return res.status(401).json({ error: "User not have this role" });
    }
    const { name, description, price, category, brand, stock, images, isActive } = req.body;
    const product = await productService.updateProduct(id, { name, description, price, category, brand, stock, images, isActive });
    res.json(product);
  } catch (err) {
    next(err);
  }
};