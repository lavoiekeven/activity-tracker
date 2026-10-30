import type { Request, Response } from 'express';
import { ActivityService } from '../services/activityService.js';
import { parseActivityInput, parseActivityFilters, parseRouteId } from '../validators/request.js';

export class ActivityController {
  constructor(private readonly activities: ActivityService) {}

  list = async (request: Request, response: Response): Promise<void> => {
    response.json(await this.activities.list(parseActivityFilters(request.query)));
  };

  get = async (request: Request, response: Response): Promise<void> => {
    response.json(await this.activities.get(parseRouteId(request.params.id, 'activity')));
  };

  create = async (request: Request, response: Response): Promise<void> => {
    response.status(201).json(await this.activities.create(parseActivityInput(request.body)));
  };
}
