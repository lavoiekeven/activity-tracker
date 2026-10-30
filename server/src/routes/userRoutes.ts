import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.patch('/:id/status', controller.setStatus);
  return router;
}
