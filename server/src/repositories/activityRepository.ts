import type Datastore from '@seald-io/nedb';
import type { Activity, ActivityFilters, ActivityInput, ActivityPage } from '../models/activity.js';
import { activityTypes, type ActivityType } from '../models/activity.js';

type StoredActivity = Omit<Activity, '_id'>;

export class ActivityRepository {
  constructor(private readonly datastore: Datastore<StoredActivity>) {}

  async countByType(): Promise<Record<ActivityType, number>> {
    const result: Record<ActivityType, number> = {
      LOGIN: 0,
      LOGOUT: 0,
      MEETING: 0,
      DOCUMENT_SUBMISSION: 0,
      DATA_CHANGE: 0,
    };
    const counts = await Promise.all(
      activityTypes.map(async (activityType) => ({
        activityType,
        count: await this.datastore.countAsync({ activityType }).execAsync(),
      })),
    );
    for (const { activityType, count } of counts) result[activityType] = count;
    return result;
  }

  count(): Promise<number> {
    return this.datastore.countAsync({}).execAsync();
  }

  findById(id: string): Promise<Activity | null> {
    return this.datastore.findOneAsync<StoredActivity>({ _id: id }).execAsync();
  }

  async findPage(filters: ActivityFilters): Promise<ActivityPage> {
    const query: Record<string, unknown> = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.activityType) query.activityType = filters.activityType;
    if (filters.startDate || filters.endDate) {
      const timestampRange: Record<string, string> = {};
      if (filters.startDate) timestampRange.$gte = filters.startDate;
      if (filters.endDate) timestampRange.$lte = filters.endDate;
      query.timestamp = timestampRange;
    }

    const [data, total] = await Promise.all([
      new Promise<Activity[]>((resolve, reject) => {
        this.datastore
          .find<StoredActivity>(query)
          .sort({ [filters.sortBy]: filters.sortDirection === 'asc' ? 1 : -1 })
          .skip((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize)
          .exec((error, documents) => {
            if (error) reject(error);
            else resolve(documents);
          });
      }),
      this.datastore.countAsync(query).execAsync(),
    ]);

    return { data, total, page: filters.page, pageSize: filters.pageSize };
  }

  create(input: ActivityInput): Promise<Activity> {
    const { timestamp, ...rest } = input;
    return this.datastore.insertAsync<StoredActivity>({
      ...rest,
      timestamp: timestamp ?? new Date().toISOString(),
    });
  }
}
