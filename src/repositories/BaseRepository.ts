// repository template
// Place all database access logic here for each model, e.g. UserRepository, ProductRepository, etc.

export class BaseRepository<T> {
  // Example: generic CRUD methods
  async findAll(): Promise<T[]> {
    throw new Error('Not implemented');
  }
  async findById(id: string): Promise<T | null> {
    throw new Error('Not implemented');
  }
  async create(data: Partial<T>): Promise<T> {
    throw new Error('Not implemented');
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    throw new Error('Not implemented');
  }
  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
