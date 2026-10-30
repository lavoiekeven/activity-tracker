import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';

export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  return router;
}
