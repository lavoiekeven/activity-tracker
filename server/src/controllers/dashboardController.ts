import type { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService.js';

export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  getSummary = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.dashboard.getSummary());
  };
}
