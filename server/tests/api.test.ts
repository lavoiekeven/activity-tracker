import Datastore from '@seald-io/nedb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import type { Activity } from '../src/models/activity.js';
import type { Project } from '../src/models/project.js';
import type { User } from '../src/models/user.js';
import { ActivityRepository } from '../src/repositories/activityRepository.js';
import { ProjectRepository } from '../src/repositories/projectRepository.js';
import { UserRepository } from '../src/repositories/userRepository.js';
import { ActivityService } from '../src/services/activityService.js';
import { DashboardService } from '../src/services/dashboardService.js';
import { ProjectService } from '../src/services/projectService.js';
import { UserService } from '../src/services/userService.js';

describe('REST API', () => {
  let directory: string;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'engagement-api-test-'));
    const users = new Datastore<Omit<User, '_id'>>({
      filename: path.join(directory, 'users.db'),
    });
    const projects = new Datastore<Omit<Project, '_id'>>({
      filename: path.join(directory, 'projects.db'),
    });
    const activities = new Datastore<Omit<Activity, '_id'>>({
      filename: path.join(directory, 'activities.db'),
    });
    await Promise.all([
      users.loadDatabaseAsync(),
      projects.loadDatabaseAsync(),
      activities.loadDatabaseAsync(),
    ]);
    await Promise.all([
      users.ensureIndexAsync({ fieldName: 'email', unique: true }),
      activities.ensureIndexAsync({ fieldName: 'userId' }),
      activities.ensureIndexAsync({ fieldName: 'projectId' }),
      activities.ensureIndexAsync({ fieldName: 'timestamp' }),
      activities.ensureIndexAsync({ fieldName: 'activityType' }),
    ]);

    const userRepository = new UserRepository(users);
    const projectRepository = new ProjectRepository(projects);
    const activityRepository = new ActivityRepository(activities);
    app = createApp(
      new UserService(userRepository),
      new ProjectService(projectRepository),
      new ActivityService(activityRepository, userRepository, projectRepository),
      new DashboardService(userRepository, projectRepository, activityRepository),
    );
  });

  afterAll(async () => {
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  it('creates users, enforces unique email, updates profiles, and changes status', async () => {
    const created = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Avery',
        lastName: 'Morgan',
        email: 'AVERY@example.test',
        role: 'Manager',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      firstName: 'Avery',
      lastName: 'Morgan',
      email: 'avery@example.test',
      isActive: true,
    });

    await request(app)
      .post('/api/users')
      .send({
        firstName: 'Other',
        lastName: 'Person',
        email: 'avery@example.test',
        role: 'Reviewer',
      })
      .expect(409);

    const userId = created.body._id as string;
    await request(app).get(`/api/users/${userId}`).expect(200);
    await request(app)
      .put(`/api/users/${userId}`)
      .send({
        firstName: 'Avery',
        lastName: 'Morgan',
        email: 'avery@example.test',
        role: 'Partner',
      })
      .expect(200)
      .expect(({ body }) => expect(body.role).toBe('Partner'));
    await request(app)
      .patch(`/api/users/${userId}/status`)
      .send({ isActive: false })
      .expect(200)
      .expect(({ body }) => expect(body.isActive).toBe(false));
    await request(app)
      .get('/api/users')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].isActive).toBe(false);
      });
  });

  it('validates and updates project records', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({
        name: 'Quarterly filing',
        description: 'A project used for API tests.',
        status: 'Active',
        startDate: '2026-01-01',
      })
      .expect(201);
    const projectId = created.body._id as string;

    await request(app).get(`/api/projects/${projectId}`).expect(200);
    await request(app)
      .put(`/api/projects/${projectId}`)
      .send({
        name: 'Quarterly filing update',
        status: 'Completed',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      })
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe('Quarterly filing update'));
    await request(app)
      .post('/api/projects')
      .send({
        name: 'Invalid date range',
        status: 'Active',
        startDate: '2026-03-01',
        endDate: '2026-02-01',
      })
      .expect(400);

    await request(app)
      .post('/api/projects')
      .send({
        name: 'Active project',
        status: 'Active',
        startDate: '2026-03-01',
      })
      .expect(201);
  });

  it('creates validated activities and filters, sorts, and paginates results', async () => {
    const user = (await request(app).get('/api/users').expect(200)).body[0] as User;
    const project = (await request(app).get('/api/projects').expect(200)).body[0] as Project;
    await request(app)
      .post('/api/activities')
      .send({
        userId: user._id,
        projectId: project._id,
        activityType: 'MEETING',
        description: 'Planning session',
        timestamp: '2026-01-05T12:00:00.000Z',
      })
      .expect(201);
    const created = await request(app)
      .post('/api/activities')
      .send({
        userId: user._id,
        activityType: 'LOGIN',
        description: 'Workspace login',
        timestamp: '2026-01-06T12:00:00.000Z',
      })
      .expect(201);

    await request(app)
      .post('/api/activities')
      .send({
        userId: 'missing-user',
        activityType: 'LOGIN',
        description: 'Invalid reference',
      })
      .expect(400);
    await request(app)
      .post('/api/activities')
      .send({ userId: user._id, activityType: 'INVALID', description: 'Invalid type' })
      .expect(400);

    await request(app)
      .get('/api/activities')
      .query({
        userId: user._id,
        projectId: project._id,
        activityType: 'MEETING',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-31T23:59:59.999Z',
        page: '1',
        pageSize: '5',
        sortBy: 'timestamp',
        sortDirection: 'asc',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBe(1);
        expect(body.data[0].activityType).toBe('MEETING');
      });
    await request(app)
      .get('/api/activities')
      .query({
        startDate: '2026-01-05',
        endDate: '2026-01-05',
        activityType: 'MEETING',
      })
      .expect(200)
      .expect(({ body }) => expect(body.total).toBe(1));

    await request(app)
      .get('/api/activities')
      .query({ page: '2', pageSize: '1', sortDirection: 'desc' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBe(2);
        expect(body.page).toBe(2);
        expect(body.data).toHaveLength(1);
        expect(body.data[0].activityType).toBe('MEETING');
      });
    await request(app).get('/api/activities').query({ pageSize: '101' }).expect(400);

    await request(app)
      .get(`/api/activities/${created.body._id as string}`)
      .expect(200);
    await request(app)
      .put(`/api/activities/${created.body._id as string}`)
      .send({})
      .expect(404);
    await request(app)
      .delete(`/api/activities/${created.body._id as string}`)
      .expect(404);
  });

  it('provides dashboard totals and activity statistics', async () => {
    await request(app)
      .get('/api/dashboard/summary')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          totalUsers: 1,
          totalProjects: 2,
          activeProjects: 1,
          totalActivities: 2,
          activitiesByType: { LOGIN: 1, MEETING: 1 },
        });
      });
  });

  it('identifies the activity user by userId, email, or both', async () => {
    const user = (await request(app).get('/api/users').expect(200)).body[0] as User;
    const base = { activityType: 'DATA_CHANGE', description: 'Identified user' };

    await request(app)
      .post('/api/activities')
      .send({ ...base, userEmail: user.email.toUpperCase() })
      .expect(201)
      .expect(({ body }) => expect(body.userId).toBe(user._id));
    await request(app)
      .post('/api/activities')
      .send({ ...base, userId: user._id, userEmail: user.email })
      .expect(201);

    await request(app).post('/api/activities').send(base).expect(400);
    await request(app)
      .post('/api/activities')
      .send({ ...base, userEmail: 'unknown@example.test' })
      .expect(400);
    await request(app)
      .post('/api/activities')
      .send({ ...base, userEmail: 'not-an-email' })
      .expect(400);
    await request(app)
      .post('/api/activities')
      .send({ ...base, userId: 'missing-user', userEmail: user.email })
      .expect(400);
  });
});
