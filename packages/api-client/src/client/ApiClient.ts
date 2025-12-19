import { UsersApi } from '../';
import { handleApiError } from './errorHandler';
import { API_CONFIG } from '../config/config';
import type { UserContracts } from '../';

/**
 * API Client wrapper for User, Todo, and List Services
 * Provides a clean interface over the generated API clients
 */
export class ApiClient {
  private usersApi: UsersApi;

  constructor(usersBaseURL: string = API_CONFIG.USERS_BASE_URL) {
    this.usersApi = new UsersApi({
      baseURL: usersBaseURL,
    });
  }

  /**
   * Create a new user
   * @param username Username (3-50 characters)
   * @param password Password (8+ characters)
   * @returns Created user information
   */
  async createUser(
    username: string,
    password: string
  ): Promise<UserContracts.UserResponseDto> {
    try {
      const response = await this.usersApi.createUser({
        username,
        password,
      });

      // Extract data from success response
      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get all users
   * @returns List of all users
   */
  async getAllUsers(): Promise<UserContracts.UserResponseDto[]> {
    try {
      const response = await this.usersApi.getAllUsers();

      // Extract data from success response
      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get user by ID
   * @param id User ID (UUID)
   * @returns User information
   */
  async getUserById(id: string): Promise<UserContracts.UserResponseDto> {
    try {
      const response = await this.usersApi.getUserById({ id });

      // Extract data from success response
      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete user by ID
   * @param id User ID (UUID)
   * @returns Deletion confirmation message
   */
  async deleteUser(id: string): Promise<string> {
    try {
      const response = await this.usersApi.deleteUser({ id });

      // Extract message from success response
      if (response.data && 'message' in response.data) {
        return response.data.message;
      }

      return 'User deleted successfully';
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Login user
   * @param username Username
   * @param password Password
   * @returns User information if authentication successful
   */
  async login(
    username: string,
    password: string
  ): Promise<UserContracts.UserResponseDto> {
    try {
      const response = await this.usersApi.login({
        username,
        password,
      });

      // Extract data from success response
      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }
}
