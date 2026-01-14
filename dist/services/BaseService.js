"use strict";
// service template
// Place all business logic here for each domain, e.g. UserService, ProductService, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    // Example: inject repository
    constructor(repository) {
        this.repository = repository;
    }
    async getAll() {
        return this.repository.findAll();
    }
    async getById(id) {
        return this.repository.findById(id);
    }
    async create(data) {
        return this.repository.create(data);
    }
    async update(id, data) {
        return this.repository.update(id, data);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
}
exports.BaseService = BaseService;
