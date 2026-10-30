export const activityTypes = [
  'LOGIN',
  'LOGOUT',
  'MEETING',
  'DOCUMENT_SUBMISSION',
  'DATA_CHANGE',
] as const;

export type ActivityType = (typeof activityTypes)[number];

export interface Activity {
  _id: string;
  userId: string;
  projectId?: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityInput {
  userId: string;
  projectId?: string;
  activityType: ActivityType;
  description: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityRequest extends Omit<ActivityInput, 'userId'> {
  userId?: string;
  userEmail?: string;
}

export interface ActivityFilters {
  userId?: string;
  projectId?: string;
  activityType?: ActivityType;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
  sortBy: 'timestamp' | 'activityType';
  sortDirection: 'asc' | 'desc';
}

export interface ActivityPage {
  data: Activity[];
  total: number;
  page: number;
  pageSize: number;
}
