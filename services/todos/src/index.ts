import { createServer } from './server';
import { config } from './config/config';

const server = createServer();

server.listen(config.port, config.host, () => {
  console.log(`Server running on http://${config.host}:${config.port}`);
  console.log(`Todos Database: ${config.todosDbPath}`);
  console.log(`Lists Database: ${config.listsDbPath}`);
  console.log(`Environment: ${config.env}`);
});
