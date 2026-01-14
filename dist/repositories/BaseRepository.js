"use strict";
// repository template
// Place all database access logic here for each model, e.g. UserRepository, ProductRepository, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    // Example: generic CRUD methods
    async findAll() {
        throw new Error('Not implemented');
    }
    async findById(id) {
        throw new Error('Not implemented');
    }
    async create(data) {
        throw new Error('Not implemented');
    }
    async update(id, data) {
        throw new Error('Not implemented');
    }
    async delete(id) {
        throw new Error('Not implemented');
    }
}
exports.BaseRepository = BaseRepository;
