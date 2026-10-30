import type { Request, Response } from 'express';
import { ProjectService } from '../services/projectService.js';
import { parseProjectInput, parseRouteId } from '../validators/request.js';

export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  list = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.projects.list());
  };

  get = async (request: Request, response: Response): Promise<void> => {
    response.json(await this.projects.get(parseRouteId(request.params.id, 'project')));
  };

  create = async (request: Request, response: Response): Promise<void> => {
    response.status(201).json(await this.projects.create(parseProjectInput(request.body)));
  };

  update = async (request: Request, response: Response): Promise<void> => {
    response.json(
      await this.projects.update(
        parseRouteId(request.params.id, 'project'),
        parseProjectInput(request.body),
      ),
    );
  };
}
