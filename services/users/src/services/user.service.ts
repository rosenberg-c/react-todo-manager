import type { IUserRepository } from '../repositories/user.repository.interface';
import type { User } from '../domain/user.types';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { LoginDto } from '../dto/login.dto';
import { hashPassword, comparePassword } from '../utils/password.util';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(dto.username);
    if (existingUser) {
      throw new ConflictError(`Username '${dto.username}' already exists`);
    }

    const passwordHash = await hashPassword(dto.password);

    return await this.userRepository.create({
      username: dto.username,
      passwordHash,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async login(dto: LoginDto): Promise<User> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      throw new ValidationError('Invalid username or password');
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new ValidationError('Invalid username or password');
    }

    return user;
  }
}
