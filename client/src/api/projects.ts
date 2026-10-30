import { requestJson } from './http';
import { parseProject, parseProjectList } from './parsers';
import type { Project } from '../types/domain';

export interface ProjectInput {
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export function getProjects(): Promise<Project[]> {
  return requestJson('/projects').then(parseProjectList);
}

export function createProject(input: ProjectInput): Promise<Project> {
  return requestJson('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((result) => {
    if (result === undefined) throw new TypeError('The API did not return the created project.');
    return parseProject(result);
  });
}

export function updateProject(id: string, input: ProjectInput): Promise<Project | undefined> {
  return requestJson(`/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  }).then((result) => (result === undefined ? undefined : parseProject(result)));
}
