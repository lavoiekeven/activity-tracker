import { requestJson } from './http';
import { parseActivity, parseActivityPage } from './parsers';
import type { Activity, ActivityFilters, ActivityInput, ActivityPage } from '../types/domain';

export function getActivities(filters: ActivityFilters): Promise<ActivityPage> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      query.set(key, String(value));
    }
  }
  return requestJson(`/activities?${query.toString()}`).then(parseActivityPage);
}

export function createActivity(input: ActivityInput): Promise<Activity> {
  return requestJson('/activities', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(parseActivity);
}
