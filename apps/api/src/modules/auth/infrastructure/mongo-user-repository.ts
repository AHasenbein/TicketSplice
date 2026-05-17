import type { Collection } from "mongodb";
import type { User } from "../domain/auth-provider.js";
import type { UserRepository } from "../domain/user-repository.js";
import { getMongoDb } from "../../../database/mongo.js";

interface UserDocument {
  _id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  providers: User["providers"];
  createdAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private collectionPromise: Promise<Collection<UserDocument>> | null = null;

  private async getCollection(): Promise<Collection<UserDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = getMongoDb().then((db) =>
        db.collection<UserDocument>("users")
      );
    }

    return this.collectionPromise;
  }

  async create(user: User): Promise<User> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: user.id },
      {
        $set: this.toDocument(user)
      },
      { upsert: true }
    );
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ _id: id });
    return user ? this.fromDocument(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return user ? this.fromDocument(user) : null;
  }

  async findByEmailVerificationTokenHash(tokenHash: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ emailVerificationTokenHash: tokenHash });
    return user ? this.fromDocument(user) : null;
  }

  async update(user: User): Promise<User> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: user.id },
      {
        $set: this.toDocument(user)
      }
    );
    return user;
  }

  private toDocument(user: User): UserDocument {
    return {
      _id: user.id,
      email: user.email,
      displayName: user.displayName,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      emailVerificationTokenHash: user.emailVerificationTokenHash,
      emailVerificationExpiresAt: user.emailVerificationExpiresAt,
      providers: user.providers,
      createdAt: user.createdAt
    };
  }

  private fromDocument(doc: UserDocument): User {
    return {
      id: doc._id,
      email: doc.email,
      displayName: doc.displayName,
      passwordHash: doc.passwordHash,
      emailVerified: doc.emailVerified,
      emailVerificationTokenHash: doc.emailVerificationTokenHash,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
      providers: doc.providers,
      createdAt: new Date(doc.createdAt)
    };
  }
}
