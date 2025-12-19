import type { IocContainer } from '@tsoa/runtime';
import { TodoService } from './services/todo.service';
import { ListService } from './services/list.service';
import { JsonTodoRepository } from './repositories/todo.repository.json';
import { JsonListRepository } from './repositories/list.repository.json';
import { config } from './config/config';
import { TodoController } from './controllers/todo.controller';
import { ListController } from './controllers/list.controller';

// Create singleton instances
const todoRepository = new JsonTodoRepository(config.todosDbPath);
const listRepository = new JsonListRepository(config.listsDbPath);
const todoService = new TodoService(todoRepository);
const listService = new ListService(listRepository, todoRepository);

// IoC container for TSOA
export const iocContainer: IocContainer = {
  get: <T>(controller: any): T => {
    if (controller === TodoController || controller.name === 'TodoController') {
      return new TodoController(todoService) as any;
    }
    if (controller === ListController || controller.name === 'ListController') {
      return new ListController(listService) as any;
    }
    throw new Error(`Unknown controller: ${controller}`);
  },
};
