// controllers/productController.ts

import { Response, Request, NextFunction } from "express";
import * as productService from "../services/product.service";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth";
import { IProduct } from "../models/Product";
import { Types } from "mongoose";
import { redisManager } from '../config/redisClient';
import { uploadFilesToCloudinary } from "../utils/cloudinaryHelpers";
import { AppError } from "../utils/AppError";

const parseJSON = (value: any) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const normalizeStringArray = (value: any): string[] | undefined => {
  const parsed = parseJSON(value);
  if (parsed === undefined || parsed === null || parsed === "") return undefined;

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => (item === undefined || item === null ? "" : String(item).trim()))
      .filter(Boolean);
  }

  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    return trimmed ? [trimmed] : undefined;
  }

  return undefined;
};

const normalizeBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizeNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeGender = (value: any): IProduct["gender"] | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  const genderMap: Record<string, IProduct["gender"]> = {
    boy: "Boys",
    boys: "Boys",
    girl: "Girls",
    girls: "Girls",
    man: "Men",
    men: "Men",
    male: "Men",
    woman: "Women",
    women: "Women",
    female: "Women",
    unisex: "Unisex",
    other: "other",
  };

  return genderMap[normalized];
};

const normalizeColors = (value: any): IProduct["colors"] | undefined => {
  const parsed = parseJSON(value);
  if (!Array.isArray(parsed)) return undefined;

  const colors = parsed
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }

      if (item && typeof item === "object") {
        const name =
          typeof item.name === "string"
            ? item.name.trim()
            : typeof item.label === "string"
              ? item.label.trim()
              : "";

        if (!name) return null;

        return {
          name,
          code: typeof item.code === "string" ? item.code : undefined,
          image: typeof item.image === "string" ? item.image : undefined,
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return colors.length ? colors : undefined;
};

const normalizeHighlights = (value: any): IProduct["highlights"] | undefined => {
  const parsed = parseJSON(value);
  if (!Array.isArray(parsed)) return undefined;

  const highlights = parsed
    .map((item) => {
      if (typeof item === "string") {
        const title = item.trim();
        return title ? { title } : null;
      }

      if (item && typeof item === "object") {
        const title =
          typeof item.title === "string"
            ? item.title.trim()
            : typeof item.name === "string"
              ? item.name.trim()
              : "";

        const description =
          typeof item.description === "string" ? item.description : undefined;
        const image = typeof item.image === "string" ? item.image : undefined;

        if (!title && !description && !image) return null;

        return { title, description, image };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return highlights.length ? highlights : undefined;
};

const normalizeProductPayload = (
  product: Partial<IProduct>,
  createdBy?: Types.ObjectId,
  fallbackImages?: string[]
): Partial<IProduct> => {
  const normalized: Partial<IProduct> = {
    ...product,
    name: typeof product.name === "string" ? product.name.trim() : product.name,
    description:
      typeof product.description === "string"
        ? product.description
        : product.description,
    price: normalizeNumber(product.price),
    originalPrice: normalizeNumber(product.originalPrice),
    discount: normalizeNumber(product.discount),
    category: normalizeStringArray(product.category),
    sku: typeof product.sku === "string" ? product.sku.trim() : product.sku,
    brand: typeof product.brand === "string" ? product.brand.trim() : product.brand,
    material:
      typeof product.material === "string" ? product.material.trim() : product.material,
    stock: normalizeNumber(product.stock),
    images: normalizeStringArray(product.images) ?? fallbackImages ?? product.images,
    isActive: normalizeBoolean(product.isActive),
    ageGroup:
      typeof product.ageGroup === "string" ? product.ageGroup.trim() : product.ageGroup,
    gender: normalizeGender(product.gender) ?? product.gender,
    featured: normalizeBoolean(product.featured),
    isNFT: normalizeBoolean(product.isNFT),
    sizes: normalizeStringArray(product.sizes),
    reviewCount: normalizeNumber(product.reviewCount),
    colors: normalizeColors(product.colors),
    features: normalizeStringArray(product.features),
    highlights: normalizeHighlights(product.highlights),
  };

  if (createdBy) {
    normalized.createdBy = createdBy;
  }

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined)
  ) as Partial<IProduct>;
};

const extractBulkProducts = (body: any): Partial<IProduct>[] => {
  const parsedBody = parseJSON(body);

  if (Array.isArray(parsedBody)) {
    return parsedBody;
  }

  const nestedProducts = parseJSON(parsedBody?.products);
  if (Array.isArray(nestedProducts)) {
    return nestedProducts;
  }

  return [];
};

export async function addProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await authService.getAuthUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role != "admin") return res.status(401).json({ error: "User not have this role" });

    // ✅ Upload images if present
    let imageUrls: string[] = [];
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      imageUrls = await uploadFilesToCloudinary(req.files as Express.Multer.File[]);
    }

    const productData = normalizeProductPayload(
      req.body,
      new Types.ObjectId(user._id),
      imageUrls
    );

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
    const productsInput = extractBulkProducts(req.body);
    if (productsInput.length === 0) {
      throw new AppError(
        "INVALID_PRODUCT_BULK_PAYLOAD",
        "Bulk product request must contain at least one product.",
        400,
        [{ field: "products", issue: "Send a JSON array or { products: [...] }." }]
      );
    }

    // Map files by product index
 

    const updatedProductsInput: Partial<IProduct>[] = await Promise.all(
      productsInput.map(async (p) => {
        const createdBy = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;

        return normalizeProductPayload(p, createdBy);
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
