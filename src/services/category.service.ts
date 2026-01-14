import { Category,ICategory } from "../models/Category";
import {User} from "../models/User";
import {AppError} from "../utils/AppError";

export const createCategory = async (category: ICategory,userId: string) => {
    const user = await User.findById(userId);
    if(!user){
        throw new AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if(user.role != "admin"){
        throw new AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const newCategory = await Category.create(category);
    if(!newCategory){
        throw new AppError("CATEGORY_NOT_CREATED", "Category not created", 400);
    }
    return newCategory;
}

export const getAllCategories = async () => {
    const categories = await Category.find();
    if(!categories){
        throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return categories;
}

export const getCategoryById = async (id: string) => {
    const category = await Category.findById(id);
    if(!category){
        throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return category;
}

export const getCategoryByName = async (name: string) => {
    const category = await Category.findOne({ name });
    if(!category){
        throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 400);
    }
    return category;
}

export const updateCategory = async (id: string, category: ICategory,userId: string) => {
    const user = await User.findById(userId);
    if(!user){
        throw new AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if(user.role != "admin"){
        throw new AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const updatedCategory = await Category.findByIdAndUpdate(id, category, { new: true });
    if(!updatedCategory){
        throw new AppError("CATEGORY_NOT_UPDATED", "Category not updated", 400);
    }
    return updatedCategory;
}

export const deleteCategory = async (id: string,userId: string) => {
    const user = await User.findById(userId);
    if(!user){
        throw new AppError("USER_NOT_FOUND", "User not found", 400);
    }
    if(user.role != "admin"){
        throw new AppError("USER_NOT_AUTHORIZED", "User not authorized", 400);
    }
    const deletedCategory = await Category.findByIdAndDelete(id);
    if(!deletedCategory){
        throw new AppError("CATEGORY_NOT_DELETED", "Category not deleted", 400);
    }
    return deletedCategory;
}
