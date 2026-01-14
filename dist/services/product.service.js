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
exports.getLastUpdated = exports.deleteProducts = exports.deleteProduct = exports.updateProducts = exports.getTotalCount = exports.updateProduct = exports.filterProducts = exports.getProducts = exports.getProduct = exports.addProducts = exports.addProduct = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Product_1 = require("../models/Product");
const AppError_1 = require("../utils/AppError");
const addProduct = async (productInput) => {
    const product = await Product_1.Product.create(productInput);
    return product;
};
exports.addProduct = addProduct;
const addProducts = async (productsInput) => {
    const products = await Product_1.Product.insertMany(productsInput);
    return products;
};
exports.addProducts = addProducts;
const getProduct = async (productId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
        throw new AppError_1.AppError("INVALID_ID", "Invalid product ID", 400, [
            { field: "productId", issue: "Must be a valid ObjectId" },
        ]);
    }
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
            { field: "productId", issue: "Does not exist in database" },
        ]);
    }
    return product;
};
exports.getProduct = getProduct;
const getProducts = async (take, skip, featured) => {
    let products;
    if (featured) {
        products = await Product_1.Product.find({ featured: featured }).skip(skip).limit(take);
    }
    else {
        products = await Product_1.Product.find().skip(skip).limit(take);
    }
    if (!products || products.length === 0) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
            { field: "productId", issue: "Does not exist in database" },
        ]);
    }
    return products;
};
exports.getProducts = getProducts;
const filterProducts = async (filter) => {
    const { category, ageGroup, gender, brand, price, stock, createdAt, isActive, take, skip, sortBy, sortOrder, featured, isNFT, sizes, } = filter;
    const query = {};
    if (featured)
        query.featured = { $in: featured };
    if (category)
        query.category = { $in: category };
    if (gender)
        query.gender = gender;
    if (ageGroup)
        query.ageGroup = { $in: ageGroup };
    if (brand)
        query.brand = brand;
    if (sizes)
        query.sizes = { $in: sizes };
    if (isNFT !== undefined)
        query.isNFT = isNFT;
    if (isActive !== undefined)
        query.isActive = isActive;
    if (price) {
        query.price = {};
        if (price.min !== undefined)
            query.price.$gte = price.min;
        if (price.max !== undefined)
            query.price.$lte = price.max;
    }
    if (stock) {
        query.stock = {};
        if (stock.min !== undefined)
            query.stock.$gte = stock.min;
        if (stock.max !== undefined)
            query.stock.$lte = stock.max;
    }
    if (createdAt) {
        query.createdAt = {};
        if (createdAt.from)
            query.createdAt.$gte = new Date(createdAt.from);
        if (createdAt.to)
            query.createdAt.$lte = new Date(createdAt.to);
    }
    // Build sort object if sortBy is provided
    const sortOptions = {};
    if (sortBy) {
        if (sortBy === "price-low") {
            sortOptions.price = 1; // ascending
        }
        else if (sortBy === "price-high") {
            sortOptions.price = -1; // descending
        }
        else {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }
    }
    const [products, total] = await Promise.all([
        Product_1.Product.find(query)
            .sort(sortOptions)
            .skip(skip || 0)
            .limit(take || 10)
            .lean(),
        Product_1.Product.countDocuments(query),
    ]);
    return [products, total];
};
exports.filterProducts = filterProducts;
const updateProduct = async (id, productInput) => {
    const product = await Product_1.Product.findByIdAndUpdate(id, productInput, { new: true });
    if (!product) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
            { field: "productId", issue: "Does not exist in database" },
        ]);
    }
    return product;
};
exports.updateProduct = updateProduct;
const getTotalCount = async () => {
    const count = await Product_1.Product.countDocuments();
    return count;
};
exports.getTotalCount = getTotalCount;
const updateProducts = async (ids, productInput) => {
    const products = await Product_1.Product.updateMany({ _id: { $in: ids } }, productInput);
    return products;
};
exports.updateProducts = updateProducts;
const deleteProduct = async (id) => {
    const product = await Product_1.Product.findByIdAndDelete(id);
    if (!product) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
            { field: "productId", issue: "Does not exist in database" },
        ]);
    }
    return product;
};
exports.deleteProduct = deleteProduct;
const deleteProducts = async (ids) => {
    if (!ids || ids.length === 0) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
            { field: "productId", issue: "Does not exist in database" },
        ]);
    }
    const product_ids = ids.map(id => new mongoose_1.Types.ObjectId(id));
    const products = await Product_1.Product.deleteMany({ _id: { $in: product_ids } });
    return products;
};
exports.deleteProducts = deleteProducts;
const getLastUpdated = async () => {
    const latest = await Product_1.Product.findOne().sort({ updatedAt: -1 }).select('updatedAt');
    return latest?.updatedAt || new Date(0);
};
exports.getLastUpdated = getLastUpdated;
