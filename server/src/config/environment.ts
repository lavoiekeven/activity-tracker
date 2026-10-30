import dotenv from 'dotenv';
import path from 'node:path';

const serverDirectory = process.cwd();
dotenv.config({ path: path.join(serverDirectory, '.env') });

function getPort(value: string | undefined): number {
  const port = Number(value ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return port;
}

function getClientOrigin(value: string | undefined): string[] {
  return (value ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const configuredDataDirectory = process.env.DATA_DIR ?? 'data';
const configuredClientDistDirectory = process.env.CLIENT_DIST_DIR;

export const environment = {
  host: process.env.HOST ?? '127.0.0.1',
  port: getPort(process.env.PORT),
  clientOrigins: getClientOrigin(process.env.CLIENT_ORIGIN),
  dataDirectory: path.resolve(serverDirectory, configuredDataDirectory),
  clientDistDirectory: configuredClientDistDirectory
    ? path.resolve(serverDirectory, configuredClientDistDirectory)
    : undefined,
};
