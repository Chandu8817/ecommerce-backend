// user.repository.ts
// Handles all DB operations for User
import { User, IUser } from "../models/User";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return User.findOne({ phone });
  }

  async create(userInput: Partial<IUser>): Promise<IUser> {
    return User.create(userInput);
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async save(user: IUser): Promise<IUser> {
    // Ensure correct typing for Mongoose Document
    const saved = await (user as any).save();
    return saved as IUser;
  }
}
