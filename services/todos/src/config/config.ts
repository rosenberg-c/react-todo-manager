import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  todosDbPath:
    process.env.TODOS_DB_PATH || path.join(process.cwd(), 'data', 'todos.json'),
  listsDbPath:
    process.env.LISTS_DB_PATH || path.join(process.cwd(), 'data', 'lists.json'),
  env: process.env.NODE_ENV || 'development',
};
