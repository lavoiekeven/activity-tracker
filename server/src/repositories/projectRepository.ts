import type Datastore from '@seald-io/nedb';
import type { Project, ProjectInput } from '../models/project.js';

type StoredProject = Omit<Project, '_id'>;

export class ProjectRepository {
  constructor(private readonly datastore: Datastore<StoredProject>) {}

  findAll(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      this.datastore
        .find<StoredProject>({})
        .sort({ name: 1 })
        .exec((error, documents) => {
          if (error) reject(error);
          else resolve(documents);
        });
    });
  }

  findById(id: string): Promise<Project | null> {
    return this.datastore.findOneAsync<StoredProject>({ _id: id }).execAsync();
  }

  count(): Promise<number> {
    return this.datastore.countAsync({}).execAsync();
  }

  countActive(): Promise<number> {
    return this.datastore.countAsync({ status: { $regex: /^active$/i } }).execAsync();
  }

  create(input: ProjectInput): Promise<Project> {
    return this.datastore.insertAsync<StoredProject>({
      ...input,
      createdAt: new Date().toISOString(),
    });
  }

  async update(id: string, input: ProjectInput): Promise<Project | null> {
    const result = await this.datastore.updateAsync<StoredProject, { returnUpdatedDocs: true }>(
      { _id: id },
      { $set: input },
      { returnUpdatedDocs: true },
    );
    return result.affectedDocuments;
  }
}
