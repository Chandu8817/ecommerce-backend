"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
// user.repository.ts
// Handles all DB operations for User
const User_1 = require("../models/User");
class UserRepository {
    async findByEmail(email) {
        return User_1.User.findOne({ email });
    }
    async findByPhone(phone) {
        return User_1.User.findOne({ phone });
    }
    async create(userInput) {
        return User_1.User.create(userInput);
    }
    async findById(id) {
        return User_1.User.findById(id);
    }
    async save(user) {
        // Ensure correct typing for Mongoose Document
        const saved = await user.save();
        return saved;
    }
}
exports.UserRepository = UserRepository;
