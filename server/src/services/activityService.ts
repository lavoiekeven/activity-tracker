import type {
  Activity,
  ActivityFilters,
  ActivityPage,
  ActivityRequest,
} from '../models/activity.js';
import { ActivityRepository } from '../repositories/activityRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import { AppError } from '../utils/appError.js';

export class ActivityService {
  constructor(
    private readonly activities: ActivityRepository,
    private readonly users: UserRepository,
    private readonly projects: ProjectRepository,
  ) {}

  list(filters: ActivityFilters): Promise<ActivityPage> {
    return this.activities.findPage(filters);
  }

  async get(id: string): Promise<Activity> {
    const activity = await this.activities.findById(id);
    if (!activity) throw new AppError('Activity not found.', 404);
    return activity;
  }

  async create(request: ActivityRequest): Promise<Activity> {
    const { userEmail, ...rest } = request;
    const userId = await this.resolveUserId(request.userId, userEmail);
    if (request.projectId && !(await this.projects.findById(request.projectId))) {
      throw new AppError('Referenced project does not exist.', 400);
    }
    return this.activities.create({ ...rest, userId });
  }

  private async resolveUserId(userId?: string, email?: string): Promise<string> {
    const byId = userId ? await this.users.findById(userId) : null;
    const byEmail = email ? await this.users.findByEmail(email) : null;
    if (userId && !byId) throw new AppError('Referenced user does not exist.', 400);
    if (email && !byEmail) throw new AppError('No user exists with the provided email.', 400);
    if (byId && byEmail && byId._id !== byEmail._id) {
      throw new AppError('userId and userEmail refer to different users.', 400);
    }
    const user = byId ?? byEmail;
    if (!user) throw new AppError('userId or userEmail is required.', 400);
    return user._id;
  }
}
