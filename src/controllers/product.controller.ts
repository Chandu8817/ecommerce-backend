// controllers/productController.ts

import { Response, Request, NextFunction } from "express";
import * as productService from "../services/product.service";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";
import { IProduct } from "../models/Product";
import { Types } from "mongoose";

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
    const products = await productService.getProducts(Number(take), Number(skip));
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export const filterProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, brand, price, stock, createdAt, isActive, take, skip } = req.body;
   


    const [products, total]:any = await productService.filterProducts({ category, brand, price, stock, createdAt, isActive, take, skip })

    res.json({
      data: products,
      total,
      page: Math.floor((skip || 0) / (take || 10)) + 1,
      pageSize: take || 10,
      totalPages: Math.ceil(total / (take || 10)),
    });

  } catch (err) {
    next(err);
  }
};