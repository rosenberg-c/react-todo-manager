import type { IocContainer } from '@tsoa/runtime';
import { UserService } from './services/user.service';
import { JsonUserRepository } from './repositories/user.repository.json';
import { config } from './config/config';
import { UserController } from './controllers/user.controller';

const userRepository = new JsonUserRepository(config.dbPath);
const userService = new UserService(userRepository);

export const iocContainer: IocContainer = {
  get: <T>(controller: any): T => {
    if (controller === UserController || controller.name === 'UserController') {
      return new UserController(userService) as any;
    }
    throw new Error(`Unknown controller: ${controller}`);
  },
};
