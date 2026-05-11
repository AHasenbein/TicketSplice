import type { User } from "../domain/auth-provider.js";
import type { UserRepository } from "../domain/user-repository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<string, User>();
  private readonly userIdsByEmail = new Map<string, string>();

  async create(user: User): Promise<User> {
    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(user.email, user.id);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.userIdsByEmail.get(email);
    if (!userId) {
      return null;
    }

    return this.usersById.get(userId) ?? null;
  }

  async update(user: User): Promise<User> {
    this.usersById.set(user.id, user);
    this.userIdsByEmail.set(user.email, user.id);
    return user;
  }
}
