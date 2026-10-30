import type Datastore from '@seald-io/nedb';
import type { User, UserInput } from '../models/user.js';

type StoredUser = Omit<User, '_id'>;

export class UserRepository {
  constructor(private readonly datastore: Datastore<StoredUser>) {}

  findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.datastore
        .find<StoredUser>({})
        .sort({ lastName: 1, firstName: 1 })
        .exec((error, documents) => {
          if (error) reject(error);
          else resolve(documents);
        });
    });
  }

  findById(id: string): Promise<User | null> {
    return this.datastore.findOneAsync<StoredUser>({ _id: id }).execAsync();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.datastore.findOneAsync<StoredUser>({ email }).execAsync();
  }

  count(): Promise<number> {
    return this.datastore.countAsync({}).execAsync();
  }

  create(input: UserInput): Promise<User> {
    const now = new Date().toISOString();
    return this.datastore.insertAsync<StoredUser>({
      ...input,
      email: input.email.toLowerCase(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(id: string, input: UserInput): Promise<User | null> {
    const result = await this.datastore.updateAsync<StoredUser, { returnUpdatedDocs: true }>(
      { _id: id },
      {
        $set: {
          ...input,
          email: input.email.toLowerCase(),
          updatedAt: new Date().toISOString(),
        },
      },
      { returnUpdatedDocs: true },
    );
    return result.affectedDocuments;
  }

  async setStatus(id: string, isActive: boolean): Promise<User | null> {
    const result = await this.datastore.updateAsync<StoredUser, { returnUpdatedDocs: true }>(
      { _id: id },
      { $set: { isActive, updatedAt: new Date().toISOString() } },
      { returnUpdatedDocs: true },
    );
    return result.affectedDocuments;
  }
}
