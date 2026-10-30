import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();
  router.get('/summary', controller.getSummary);
  return router;
}
