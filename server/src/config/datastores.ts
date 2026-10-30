import Datastore from '@seald-io/nedb';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { environment } from './environment.js';
import type { Activity } from '../models/activity.js';
import type { Project } from '../models/project.js';
import type { User } from '../models/user.js';

export const usersDatastore = new Datastore<Omit<User, '_id'>>({
  filename: path.join(environment.dataDirectory, 'users.db'),
});
export const projectsDatastore = new Datastore<Omit<Project, '_id'>>({
  filename: path.join(environment.dataDirectory, 'projects.db'),
});
export const activitiesDatastore = new Datastore<Omit<Activity, '_id'>>({
  filename: path.join(environment.dataDirectory, 'activities.db'),
});

export async function initializeDatastores(): Promise<void> {
  await mkdir(environment.dataDirectory, { recursive: true });

  await Promise.all([
    usersDatastore.loadDatabaseAsync(),
    projectsDatastore.loadDatabaseAsync(),
    activitiesDatastore.loadDatabaseAsync(),
  ]);

  await Promise.all([
    usersDatastore.ensureIndexAsync({ fieldName: 'email', unique: true }),
    activitiesDatastore.ensureIndexAsync({ fieldName: 'userId' }),
    activitiesDatastore.ensureIndexAsync({ fieldName: 'projectId' }),
    activitiesDatastore.ensureIndexAsync({ fieldName: 'timestamp' }),
    activitiesDatastore.ensureIndexAsync({ fieldName: 'activityType' }),
  ]);
}
