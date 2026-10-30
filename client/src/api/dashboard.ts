import { parseDashboardSummary } from './parsers';
import { requestJson } from './http';
import type { DashboardSummary } from '../types/domain';

export function getDashboardSummary(): Promise<DashboardSummary> {
  return requestJson('/dashboard/summary').then(parseDashboardSummary);
}
