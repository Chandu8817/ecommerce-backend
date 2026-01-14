"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryByName = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = require("../models/Category");
const User_1 = require("../models/User");
const AppError_1 = require("../utils/AppError");
const createCategory = async (category, userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if (user.role != "admin") {
        throw new AppError_1.AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const newCategory = await Category_1.Category.create(category);
    if (!newCategory) {
        throw new AppError_1.AppError("CATEGORY_NOT_CREATED", "Category not created", 400);
    }
    return newCategory;
};
exports.createCategory = createCategory;
const getAllCategories = async () => {
    const categories = await Category_1.Category.find();
    if (!categories) {
        throw new AppError_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return categories;
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    const category = await Category_1.Category.findById(id);
    if (!category) {
        throw new AppError_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return category;
};
exports.getCategoryById = getCategoryById;
const getCategoryByName = async (name) => {
    const category = await Category_1.Category.findOne({ name });
    if (!category) {
        throw new AppError_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return category;
};
exports.getCategoryByName = getCategoryByName;
const updateCategory = async (id, category, userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if (user.role != "admin") {
        throw new AppError_1.AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const updatedCategory = await Category_1.Category.findByIdAndUpdate(id, category, { new: true });
    if (!updatedCategory) {
        throw new AppError_1.AppError("CATEGORY_NOT_UPDATED", "Category not updated", 400);
    }
    return updatedCategory;
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id, userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if (user.role != "admin") {
        throw new AppError_1.AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const deletedCategory = await Category_1.Category.findByIdAndDelete(id);
    if (!deletedCategory) {
        throw new AppError_1.AppError("CATEGORY_NOT_DELETED", "Category not deleted", 400);
    }
    return deletedCategory;
};
exports.deleteCategory = deleteCategory;
