// service template
// Place all business logic here for each domain, e.g. UserService, ProductService, etc.

export class BaseService<T> {
  // Example: inject repository
  constructor(private repository: any) {}

  async getAll(): Promise<T[]> {
    return this.repository.findAll();
  }
  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }
  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.repository.update(id, data);
  }
  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
