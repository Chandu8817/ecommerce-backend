"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingAddress = exports.removeShippingAddress = exports.addShippingAddress = exports.getAuthUser = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const AppError_1 = require("../utils/AppError");
const register = async (userInput) => {
    const { email } = userInput;
    const exists = await User_1.User.findOne({ email });
    if (exists)
        throw new Error("User already exists");
    const user = await User_1.User.create(userInput);
    return user;
};
exports.register = register;
const login = async (userInput) => {
    const { email, password } = userInput;
    const user = await User_1.User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return user;
    }
    else {
        throw new AppError_1.AppError("INVALID CREDIENTAILS", "Invalid credientails", 404, [{ field: "userId", issue: "Does not exist in database" }]);
    }
};
exports.login = login;
const getAuthUser = async (_id) => {
    const user = await User_1.User.findById(_id);
    return user;
};
exports.getAuthUser = getAuthUser;
const addShippingAddress = async (_id, shippingAddress) => {
    const user = await User_1.User.findById(_id);
    if (!user)
        throw new Error("User not found");
    user.shippingAddress.push(shippingAddress);
    await user.save();
    return user;
};
exports.addShippingAddress = addShippingAddress;
const removeShippingAddress = async (_id, id) => {
    const user = await User_1.User.findById(_id);
    if (!user)
        throw new Error("User not found");
    const addresses = user.shippingAddress;
    addresses.splice(id, 1);
    user.shippingAddress = addresses;
    await user.save();
    return user;
};
exports.removeShippingAddress = removeShippingAddress;
const getShippingAddress = async (_id) => {
    const user = await User_1.User.findById(_id);
    if (!user)
        throw new Error("User not found");
    const shippingAddress = user.shippingAddress;
    return shippingAddress;
};
exports.getShippingAddress = getShippingAddress;
