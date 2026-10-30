import {
  activityTypes,
  type Activity,
  type ActivityPage,
  type ActivityType,
  type DashboardSummary,
  type Project,
  type User,
} from '../types/domain';

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`Invalid API response: expected ${label} object.`);
  }
  const record: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    record[key] = entry;
  }
  return record;
}

function isActivityType(value: unknown): value is ActivityType {
  return activityTypes.some((type) => type === value);
}

function expectString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`Invalid API response: expected ${label} to be a string.`);
  }
  return value;
}

function expectNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`Invalid API response: expected ${label} to be a non-negative integer.`);
  }
  return value;
}

export function parseUser(value: unknown): User {
  const record = expectRecord(value, 'user');
  if (typeof record.isActive !== 'boolean') {
    throw new TypeError('Invalid API response: expected user.isActive to be a boolean.');
  }

  return {
    _id: expectString(record._id, 'user._id'),
    firstName: expectString(record.firstName, 'user.firstName'),
    lastName: expectString(record.lastName, 'user.lastName'),
    email: expectString(record.email, 'user.email'),
    role: expectString(record.role, 'user.role'),
    isActive: record.isActive,
    createdAt: expectString(record.createdAt, 'user.createdAt'),
    updatedAt: expectString(record.updatedAt, 'user.updatedAt'),
  };
}

export function parseProject(value: unknown): Project {
  const record = expectRecord(value, 'project');
  return {
    _id: expectString(record._id, 'project._id'),
    name: expectString(record.name, 'project.name'),
    description:
      record.description === undefined
        ? undefined
        : expectString(record.description, 'project.description'),
    status: expectString(record.status, 'project.status'),
    startDate: expectString(record.startDate, 'project.startDate'),
    endDate:
      record.endDate === undefined ? undefined : expectString(record.endDate, 'project.endDate'),
    createdAt: expectString(record.createdAt, 'project.createdAt'),
  };
}

export function parseActivity(value: unknown): Activity {
  const record = expectRecord(value, 'activity');
  if (!isActivityType(record.activityType)) {
    throw new TypeError('Invalid API response: activity.activityType is unsupported.');
  }

  let metadata: Record<string, unknown> | undefined;
  if (record.metadata !== undefined) {
    metadata = expectRecord(record.metadata, 'activity.metadata');
  }

  return {
    _id: expectString(record._id, 'activity._id'),
    userId: expectString(record.userId, 'activity.userId'),
    projectId:
      record.projectId === undefined
        ? undefined
        : expectString(record.projectId, 'activity.projectId'),
    activityType: record.activityType,
    description: expectString(record.description, 'activity.description'),
    timestamp: expectString(record.timestamp, 'activity.timestamp'),
    metadata,
  };
}

export function parseUserList(value: unknown): User[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Invalid API response: expected a user array.');
  }
  return value.map(parseUser);
}

export function parseProjectList(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Invalid API response: expected a project array.');
  }
  return value.map(parseProject);
}

export function parseActivityPage(value: unknown): ActivityPage {
  const record = expectRecord(value, 'activity page');
  if (!Array.isArray(record.data)) {
    throw new TypeError('Invalid API response: expected activity page data array.');
  }

  return {
    data: record.data.map(parseActivity),
    total: expectNumber(record.total, 'activity page total'),
    page: expectNumber(record.page, 'activity page page'),
    pageSize: expectNumber(record.pageSize, 'activity page pageSize'),
  };
}

export function parseDashboardSummary(value: unknown): DashboardSummary {
  const record = expectRecord(value, 'dashboard summary');
  const counts = expectRecord(record.activitiesByType, 'dashboard activitiesByType');
  const activitiesByType: Record<ActivityType, number> = {
    LOGIN: expectNumber(counts.LOGIN, 'dashboard activitiesByType.LOGIN'),
    LOGOUT: expectNumber(counts.LOGOUT, 'dashboard activitiesByType.LOGOUT'),
    MEETING: expectNumber(counts.MEETING, 'dashboard activitiesByType.MEETING'),
    DOCUMENT_SUBMISSION: expectNumber(
      counts.DOCUMENT_SUBMISSION,
      'dashboard activitiesByType.DOCUMENT_SUBMISSION',
    ),
    DATA_CHANGE: expectNumber(counts.DATA_CHANGE, 'dashboard activitiesByType.DATA_CHANGE'),
  };

  return {
    totalUsers: expectNumber(record.totalUsers, 'dashboard totalUsers'),
    totalProjects: expectNumber(record.totalProjects, 'dashboard totalProjects'),
    activeProjects: expectNumber(record.activeProjects, 'dashboard activeProjects'),
    totalActivities: expectNumber(record.totalActivities, 'dashboard totalActivities'),
    activitiesByType,
  };
}
