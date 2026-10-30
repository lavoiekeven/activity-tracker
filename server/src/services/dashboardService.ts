import type { ActivityType } from '../models/activity.js';
import { ActivityRepository } from '../repositories/activityRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { UserRepository } from '../repositories/userRepository.js';

export interface DashboardSummary {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
}

export class DashboardService {
  constructor(
    private readonly users: UserRepository,
    private readonly projects: ProjectRepository,
    private readonly activities: ActivityRepository,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const [totalUsers, totalProjects, activeProjects, totalActivities, activitiesByType] =
      await Promise.all([
        this.users.count(),
        this.projects.count(),
        this.projects.countActive(),
        this.activities.count(),
        this.activities.countByType(),
      ]);

    return { totalUsers, totalProjects, activeProjects, totalActivities, activitiesByType };
  }
}
