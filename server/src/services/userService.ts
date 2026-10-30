import type { User, UserInput } from '../models/user.js';
import { UserRepository } from '../repositories/userRepository.js';
import { AppError } from '../utils/appError.js';

export class UserService {
  constructor(private readonly users: UserRepository) {}

  list(): Promise<User[]> {
    return this.users.findAll();
  }

  async get(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async create(input: UserInput): Promise<User> {
    if (await this.users.findByEmail(input.email.toLowerCase())) {
      throw new AppError('A user with this email already exists.', 409);
    }
    try {
      return await this.users.create(input);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unique constraint')) {
        throw new AppError('A user with this email already exists.', 409);
      }
      throw error;
    }
  }

  async update(id: string, input: UserInput): Promise<User> {
    await this.get(id);
    const existing = await this.users.findByEmail(input.email.toLowerCase());
    if (existing && existing._id !== id) {
      throw new AppError('A user with this email already exists.', 409);
    }
    try {
      const user = await this.users.update(id, input);
      if (!user) throw new AppError('User not found.', 404);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unique constraint')) {
        throw new AppError('A user with this email already exists.', 409);
      }
      throw error;
    }
  }

  async setStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.users.setStatus(id, isActive);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }
}
