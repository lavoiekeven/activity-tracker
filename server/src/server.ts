import { app } from './app.js';
import { initializeDatastores } from './config/datastores.js';
import { environment } from './config/environment.js';

async function startServer(): Promise<void> {
  await initializeDatastores();

  app.listen(environment.port, environment.host, () => {
    console.info(`API listening at http://${environment.host}:${environment.port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to initialize the server:', error);
  process.exitCode = 1;
});
