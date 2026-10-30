import type { Project, ProjectInput } from '../models/project.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { AppError } from '../utils/appError.js';

export class ProjectService {
  constructor(private readonly projects: ProjectRepository) {}

  list(): Promise<Project[]> {
    return this.projects.findAll();
  }

  async get(id: string): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }

  create(input: ProjectInput): Promise<Project> {
    return this.projects.create(input);
  }

  async update(id: string, input: ProjectInput): Promise<Project> {
    const project = await this.projects.update(id, input);
    if (!project) throw new AppError('Project not found.', 404);
    return project;
  }
}
