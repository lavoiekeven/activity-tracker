import cors from 'cors';
import express from 'express';
import { ActivityController } from './controllers/activityController.js';
import { DashboardController } from './controllers/dashboardController.js';
import { ProjectController } from './controllers/projectController.js';
import { UserController } from './controllers/userController.js';
import { activitiesDatastore, projectsDatastore, usersDatastore } from './config/datastores.js';
import { environment } from './config/environment.js';
import { ActivityRepository } from './repositories/activityRepository.js';
import { ProjectRepository } from './repositories/projectRepository.js';
import { UserRepository } from './repositories/userRepository.js';
import { ActivityService } from './services/activityService.js';
import { DashboardService } from './services/dashboardService.js';
import { ProjectService } from './services/projectService.js';
import { UserService } from './services/userService.js';
import { AppError } from './utils/appError.js';
import { createActivityRoutes } from './routes/activityRoutes.js';
import { createDashboardRoutes } from './routes/dashboardRoutes.js';
import { createProjectRoutes } from './routes/projectRoutes.js';
import { createUserRoutes } from './routes/userRoutes.js';

export function createApp(
  userService: UserService,
  projectService: ProjectService,
  activityService: ActivityService,
  dashboardService: DashboardService,
) {
  const app = express();

  app.use(
    cors({
      origin: environment.clientOrigins,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.use('/api/users', createUserRoutes(new UserController(userService)));
  app.use('/api/projects', createProjectRoutes(new ProjectController(projectService)));
  app.use('/api/activities', createActivityRoutes(new ActivityController(activityService)));
  app.use('/api/dashboard', createDashboardRoutes(new DashboardController(dashboardService)));

  if (environment.clientDistDirectory) {
    app.use(express.static(environment.clientDistDirectory, { index: false }));
    app.get(/^(?!\/api(?:\/|$)).*/, (_request, response, next) => {
      response.sendFile('index.html', { root: environment.clientDistDirectory }, (error) => {
        if (error) next(error);
      });
    });
  }

  app.use((_request, response) => {
    response.status(404).json({ error: 'Not Found' });
  });

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }

      if (error instanceof AppError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 400
      ) {
        response.status(400).json({ error: 'Invalid request body.' });
        return;
      }

      console.error('Unhandled request error:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    },
  );

  return app;
}

const userRepository = new UserRepository(usersDatastore);
const projectRepository = new ProjectRepository(projectsDatastore);
const activityRepository = new ActivityRepository(activitiesDatastore);
export const app = createApp(
  new UserService(userRepository),
  new ProjectService(projectRepository),
  new ActivityService(activityRepository, userRepository, projectRepository),
  new DashboardService(userRepository, projectRepository, activityRepository),
);
