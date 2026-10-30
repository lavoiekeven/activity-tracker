import {
  activityTypes,
  type ActivityFilters,
  type ActivityRequest,
  type ActivityType,
} from '../models/activity.js';
import type { ProjectInput } from '../models/project.js';
import type { UserInput } from '../models/user.js';
import { AppError } from '../utils/appError.js';

type RequestRecord = Record<string, unknown>;

function record(value: unknown, label: string): RequestRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AppError(`${label} must be an object.`, 400);
  }
  const result: RequestRecord = {};
  for (const [key, entry] of Object.entries(value)) result[key] = entry;
  return result;
}

function string(value: unknown, label: string, maxLength = 200): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new AppError(
      `${label} must be a non-empty string of at most ${maxLength} characters.`,
      400,
    );
  }
  return value.trim();
}

function optionalString(value: unknown, label: string, maxLength = 200): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return string(value, label, maxLength);
}

function isoDate(value: unknown, label: string): string {
  const parsed = string(value, label, 40);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(parsed);
  const isoTimestamp =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/i.test(parsed);
  const datePart = parsed.slice(0, 10);
  const validCalendarDate =
    /^\d{4}-\d{2}-\d{2}$/.test(datePart) &&
    new Date(`${datePart}T00:00:00.000Z`).toISOString().slice(0, 10) === datePart;
  if ((!dateOnly && !isoTimestamp) || !validCalendarDate || !Number.isFinite(Date.parse(parsed))) {
    throw new AppError(`${label} must be a valid ISO 8601 date.`, 400);
  }
  const date = new Date(parsed);
  return date.toISOString();
}

function endOfDateFilter(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return isoDate(`${value}T23:59:59.999Z`, 'endDate');
  }
  return isoDate(value, 'endDate');
}

export function parseUserInput(value: unknown): UserInput {
  const input = record(value, 'User');
  const email = string(input.email, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('email must be a valid email address.', 400);
  }
  return {
    firstName: string(input.firstName, 'firstName', 100),
    lastName: string(input.lastName, 'lastName', 100),
    email,
    role: string(input.role, 'role', 100),
  };
}

export function parseRouteId(value: string | string[] | undefined, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 100) {
    throw new AppError(`A valid ${label} id is required.`, 400);
  }
  return value;
}

export function parseUserStatus(value: unknown): boolean {
  const input = record(value, 'User status');
  if (typeof input.isActive !== 'boolean') {
    throw new AppError('isActive must be a boolean.', 400);
  }
  return input.isActive;
}

export function parseProjectInput(value: unknown): ProjectInput {
  const input = record(value, 'Project');
  const startDate = isoDate(input.startDate, 'startDate');
  const endDate =
    input.endDate === undefined || input.endDate === ''
      ? undefined
      : isoDate(input.endDate, 'endDate');
  if (endDate && endDate < startDate) {
    throw new AppError('endDate must be on or after startDate.', 400);
  }
  return {
    name: string(input.name, 'name', 200),
    description: optionalString(input.description, 'description', 2000),
    status: string(input.status, 'status', 50),
    startDate,
    endDate,
  };
}

function isActivityType(value: unknown): value is ActivityType {
  return activityTypes.some((type) => type === value);
}

function emailAddress(value: unknown, label: string): string {
  const email = string(value, label, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(`${label} must be a valid email address.`, 400);
  }
  return email;
}

export function parseActivityInput(value: unknown): ActivityRequest {
  const input = record(value, 'Activity');
  const userId = optionalString(input.userId, 'userId', 100);
  const userEmail =
    input.userEmail === undefined || input.userEmail === null || input.userEmail === ''
      ? undefined
      : emailAddress(input.userEmail, 'userEmail');
  if (!userId && !userEmail) {
    throw new AppError('userId or userEmail is required.', 400);
  }
  if (!isActivityType(input.activityType)) {
    throw new AppError(`activityType must be one of: ${activityTypes.join(', ')}.`, 400);
  }

  let metadata: Record<string, unknown> | undefined;
  if (input.metadata !== undefined) metadata = record(input.metadata, 'metadata');

  return {
    userId,
    userEmail,
    projectId: optionalString(input.projectId, 'projectId', 100),
    activityType: input.activityType,
    description: string(input.description, 'description', 2000),
    timestamp: input.timestamp === undefined ? undefined : isoDate(input.timestamp, 'timestamp'),
    metadata,
  };
}

function queryString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new AppError(`${label} must be a string.`, 400);
  return value;
}

function queryInteger(value: unknown, label: string, defaultValue: number, max: number): number {
  const raw = queryString(value, label);
  if (raw === undefined) return defaultValue;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new AppError(`${label} must be an integer between 1 and ${max}.`, 400);
  }
  return parsed;
}

export function parseActivityFilters(value: unknown): ActivityFilters {
  const query = record(value, 'Query');
  const rawActivityType = queryString(query.activityType, 'activityType');
  if (rawActivityType && !isActivityType(rawActivityType)) {
    throw new AppError(`activityType must be one of: ${activityTypes.join(', ')}.`, 400);
  }
  const activityType = rawActivityType as ActivityType | undefined;
  const startDateRaw = queryString(query.startDate, 'startDate');
  const endDateRaw = queryString(query.endDate, 'endDate');
  const startDate = startDateRaw ? isoDate(startDateRaw, 'startDate') : undefined;
  const endDate = endOfDateFilter(endDateRaw);
  if (startDate && endDate && startDate > endDate) {
    throw new AppError('startDate must be on or before endDate.', 400);
  }

  const sortBy = queryString(query.sortBy, 'sortBy') ?? 'timestamp';
  if (sortBy !== 'timestamp' && sortBy !== 'activityType') {
    throw new AppError('sortBy must be timestamp or activityType.', 400);
  }
  const sortDirection = queryString(query.sortDirection, 'sortDirection') ?? 'desc';
  if (sortDirection !== 'asc' && sortDirection !== 'desc') {
    throw new AppError('sortDirection must be asc or desc.', 400);
  }

  return {
    userId: queryString(query.userId, 'userId'),
    projectId: queryString(query.projectId, 'projectId'),
    activityType,
    startDate,
    endDate,
    page: queryInteger(query.page, 'page', 1, 1_000_000),
    pageSize: queryInteger(query.pageSize, 'pageSize', 10, 100),
    sortBy,
    sortDirection,
  };
}
