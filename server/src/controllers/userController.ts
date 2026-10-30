import type { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { parseRouteId, parseUserInput, parseUserStatus } from '../validators/request.js';

export class UserController {
  constructor(private readonly users: UserService) {}

  list = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.users.list());
  };

  get = async (request: Request, response: Response): Promise<void> => {
    response.json(await this.users.get(parseRouteId(request.params.id, 'user')));
  };

  create = async (request: Request, response: Response): Promise<void> => {
    response.status(201).json(await this.users.create(parseUserInput(request.body)));
  };

  update = async (request: Request, response: Response): Promise<void> => {
    response.json(
      await this.users.update(
        parseRouteId(request.params.id, 'user'),
        parseUserInput(request.body),
      ),
    );
  };

  setStatus = async (request: Request, response: Response): Promise<void> => {
    response.json(
      await this.users.setStatus(
        parseRouteId(request.params.id, 'user'),
        parseUserStatus(request.body),
      ),
    );
  };
}
