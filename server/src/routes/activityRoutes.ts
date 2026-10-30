import { Router } from 'express';
import { ActivityController } from '../controllers/activityController.js';

export function createActivityRoutes(controller: ActivityController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  return router;
}
