import { UserService } from '../user.service';
import { InMemoryUserRepository } from '../../repositories/__tests__/user.repository.memory';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors';
import type { CreateUserDto } from '../../dto/create-user.dto';
import type { LoginDto } from '../../dto/login.dto';

describe('UserService', () => {
  let userRepo: InMemoryUserRepository;
  let service: UserService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    service = new UserService(userRepo);
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const dto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      const user = await service.createUser(dto);

      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('password123');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw ConflictError when username already exists', async () => {
      const dto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
      };

      await service.createUser(dto);

      await expect(service.createUser(dto)).rejects.toThrow(ConflictError);
      await expect(service.createUser(dto)).rejects.toThrow(
        "Username 'existinguser' already exists"
      );
    });

    it('should allow creating multiple users with different usernames', async () => {
      const user1 = await service.createUser({
        username: 'user1',
        password: 'pass1',
      });
      const user2 = await service.createUser({
        username: 'user2',
        password: 'pass2',
      });

      expect(user1.username).toBe('user1');
      expect(user2.username).toBe('user2');
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      const user = await service.createUser({
        username: 'userToDelete',
        password: 'password123',
      });

      await expect(service.deleteUser(user.id)).resolves.toBeUndefined();

      await expect(service.getUserById(user.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        NotFoundError
      );
      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        "User with id 'nonexistent-id' not found"
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const created = await service.createUser({
        username: 'testuser',
        password: 'password123',
      });

      const found = await service.getUserById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.username).toBe('testuser');
      expect(found.passwordHash).toBeDefined();
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(service.getUserById('nonexistent-id')).rejects.toThrow(
        NotFoundError
      );
      await expect(service.getUserById('nonexistent-id')).rejects.toThrow(
        "User with id 'nonexistent-id' not found"
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', async () => {
      const users = await service.getAllUsers();

      expect(users).toEqual([]);
    });

    it('should return all users', async () => {
      await service.createUser({ username: 'user1', password: 'pass1' });
      await service.createUser({ username: 'user2', password: 'pass2' });
      await service.createUser({ username: 'user3', password: 'pass3' });

      const users = await service.getAllUsers();

      expect(users).toHaveLength(3);
      expect(users.map((u) => u.username)).toEqual(
        expect.arrayContaining(['user1', 'user2', 'user3'])
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.createUser({
        username: 'loginuser',
        password: 'correctpassword',
      });
    });

    it('should return user when credentials are valid', async () => {
      const dto: LoginDto = {
        username: 'loginuser',
        password: 'correctpassword',
      };

      const user = await service.login(dto);

      expect(user.username).toBe('loginuser');
      expect(user.id).toBeDefined();
      expect(user.passwordHash).toBeDefined();
    });

    it('should throw ValidationError when username does not exist', async () => {
      const dto: LoginDto = {
        username: 'nonexistentuser',
        password: 'anypassword',
      };

      await expect(service.login(dto)).rejects.toThrow(ValidationError);
      await expect(service.login(dto)).rejects.toThrow(
        'Invalid username or password'
      );
    });

    it('should throw ValidationError when password is incorrect', async () => {
      const dto: LoginDto = {
        username: 'loginuser',
        password: 'wrongpassword',
      };

      await expect(service.login(dto)).rejects.toThrow(ValidationError);
      await expect(service.login(dto)).rejects.toThrow(
        'Invalid username or password'
      );
    });

    it('should not reveal whether username or password is wrong', async () => {
      const invalidUsername: LoginDto = {
        username: 'nonexistent',
        password: 'anypassword',
      };
      const invalidPassword: LoginDto = {
        username: 'loginuser',
        password: 'wrongpassword',
      };

      let error1: Error | undefined;
      let error2: Error | undefined;

      try {
        await service.login(invalidUsername);
      } catch (e) {
        error1 = e as Error;
      }

      try {
        await service.login(invalidPassword);
      } catch (e) {
        error2 = e as Error;
      }

      expect(error1?.message).toBe(error2?.message);
      expect(error1?.message).toBe('Invalid username or password');
    });
  });
});
