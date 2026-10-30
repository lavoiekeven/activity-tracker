import { requestJson } from './http';
import { parseUser, parseUserList } from './parsers';
import type { User } from '../types/domain';

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function getUsers(): Promise<User[]> {
  return requestJson('/users').then(parseUserList);
}

export function getUser(id: string): Promise<User> {
  return requestJson(`/users/${encodeURIComponent(id)}`).then(parseUser);
}

export function createUser(input: UserInput): Promise<User> {
  return requestJson('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(parseUser);
}

export function updateUser(id: string, input: UserInput): Promise<User | undefined> {
  return requestJson(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  }).then((result) => (result === undefined ? undefined : parseUser(result)));
}

export function setUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
  return requestJson(`/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  }).then((result) => (result === undefined ? undefined : parseUser(result)));
}
