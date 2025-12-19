import { UsersApi, TodosApi, ListsApi } from '../';
import { handleApiError } from './errorHandler';
import { API_CONFIG } from '../config/config';
import type { UserContracts, TodoContracts, ListContracts } from '../';

/**
 * API Client wrapper for User, Todo, and List Services
 * Provides a clean interface over the generated API clients
 */
export class ApiClient {
  private usersApi: UsersApi;
  private todosApi: TodosApi;
  private listsApi: ListsApi;

  constructor(
    usersBaseURL: string = API_CONFIG.USERS_BASE_URL,
    todosBaseURL: string = API_CONFIG.TODOS_BASE_URL
  ) {
    this.usersApi = new UsersApi({
      baseURL: usersBaseURL,
    });
    this.todosApi = new TodosApi({
      baseURL: todosBaseURL,
    });
    this.listsApi = new ListsApi({
      baseURL: todosBaseURL,
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

  // ===== Todo Methods =====

  /**
   * Create a new todo
   * @param title Todo title
   * @param userId User ID who owns this todo
   * @param listId List ID where this todo belongs
   * @param description Optional todo description
   * @returns Created todo information
   */
  async createTodo(
    title: string,
    userId: string,
    listId: string,
    description?: string
  ): Promise<TodoContracts.TodoResponseDto> {
    try {
      const response = await this.todosApi.createTodo({
        title,
        description,
        listId,
        userId,
      });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get all todos, optionally filtered by user ID
   * @param userId Optional user ID to filter todos
   * @returns List of todos
   */
  async getAllTodos(userId?: string): Promise<TodoContracts.TodoResponseDto[]> {
    try {
      const response = await this.todosApi.getAllTodos({ userId });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get todo by ID
   * @param id Todo ID (UUID)
   * @returns Todo information
   */
  async getTodoById(id: string): Promise<TodoContracts.TodoResponseDto> {
    try {
      const response = await this.todosApi.getTodoById({ id });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update a todo
   * @param id Todo ID (UUID)
   * @param updates Object containing fields to update (title, description, listId)
   * @returns Updated todo information
   */
  async updateTodo(
    id: string,
    updates: {
      title?: string;
      description?: string;
      listId?: string;
      status?: TodoContracts.TodoStatus; // Deprecated
    }
  ): Promise<TodoContracts.TodoResponseDto> {
    try {
      const response = await this.todosApi.updateTodo({ id }, updates);

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete todo by ID
   * @param id Todo ID (UUID)
   * @returns Deletion confirmation message
   */
  async deleteTodo(id: string): Promise<string> {
    try {
      const response = await this.todosApi.deleteTodo({ id });

      if (response.data && 'message' in response.data) {
        return response.data.message;
      }

      return 'Todo deleted successfully';
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete all todos for a specific user
   * @param userId User ID (UUID)
   * @returns Number of todos deleted
   */
  async deleteTodosByUserId(userId: string): Promise<number> {
    try {
      const todos = await this.getAllTodos(userId);

      await Promise.all(todos.map((todo) => this.deleteTodo(todo.id)));

      return todos.length;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Reorder a todo by updating its priority
   * @param id Todo ID (UUID)
   * @param priority New priority value
   * @param userId User ID who owns this todo
   * @returns Reorder confirmation message
   */
  async reorderTodo(
    id: string,
    priority: number,
    userId: string
  ): Promise<string> {
    try {
      const response = await this.todosApi.reorderTodo(
        { id },
        { priority, userId }
      );

      if (response.data && 'message' in response.data) {
        return response.data.message;
      }

      return 'Todo reordered successfully';
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Move a todo to a different list
   * @param id Todo ID (UUID)
   * @param listId Target list ID
   * @returns Updated todo information
   */
  async moveToList(
    id: string,
    listId: string
  ): Promise<TodoContracts.TodoResponseDto> {
    try {
      const response = await this.todosApi.moveToList({ id }, { listId });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  // ===== List Methods =====

  /**
   * Create a new list
   * @param name List name
   * @param userId User ID who owns this list
   * @returns Created list information
   */
  async createList(
    name: string,
    userId: string
  ): Promise<ListContracts.ListResponseDto> {
    try {
      const response = await this.listsApi.createList({
        name,
        userId,
      });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get all lists, optionally filtered by user ID
   * @param userId Optional user ID to filter lists
   * @returns List of lists
   */
  async getAllLists(userId?: string): Promise<ListContracts.ListResponseDto[]> {
    try {
      const response = await this.listsApi.getAllLists({ userId });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get list by ID
   * @param id List ID (UUID)
   * @returns List information
   */
  async getListById(id: string): Promise<ListContracts.ListResponseDto> {
    try {
      const response = await this.listsApi.getListById({ id });

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update a list
   * @param id List ID (UUID)
   * @param updates Object containing fields to update (name, priority)
   * @returns Updated list information
   */
  async updateList(
    id: string,
    updates: {
      name?: string;
      priority?: number;
    }
  ): Promise<ListContracts.ListResponseDto> {
    try {
      const response = await this.listsApi.updateList({ id }, updates);

      if (response.data && 'data' in response.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete list by ID
   * @param id List ID (UUID)
   * @param userId User ID for ownership validation
   * @returns Deletion confirmation message
   */
  async deleteList(id: string, userId: string): Promise<string> {
    try {
      const response = await this.listsApi.deleteList({ id, userId });

      if (response.data && 'message' in response.data) {
        return response.data.message;
      }

      return 'List deleted successfully';
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Reorder a list by updating its priority
   * @param id List ID (UUID)
   * @param priority New priority value
   * @param userId User ID who owns this list
   * @returns Reorder confirmation message
   */
  async reorderList(
    id: string,
    priority: number,
    userId: string
  ): Promise<string> {
    try {
      const response = await this.listsApi.reorderList(
        { id },
        { priority, userId }
      );

      if (response.data && 'message' in response.data) {
        return response.data.message;
      }

      return 'List reordered successfully';
    } catch (error) {
      handleApiError(error);
    }
  }
}
