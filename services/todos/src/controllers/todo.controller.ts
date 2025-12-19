import {
  Controller,
  Route,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Path,
  Query,
  SuccessResponse,
  Response as TsoaResponse,
  Tags,
} from 'tsoa';
import { TodoService } from '../services/todo.service';
import { CreateTodoDto, validateCreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto, validateUpdateTodoDto } from '../dto/update-todo.dto';
import { TodoResponseDto, toTodoResponseDto } from '../dto/todo-response.dto';
import type {
  SuccessDataResponse,
  SuccessMessageResponse,
  ErrorResponse,
} from '../types/responses';

@Route('todos')
@Tags('Todos')
export class TodoController extends Controller {
  private todoService: TodoService;

  constructor(todoService: TodoService) {
    super();
    this.todoService = todoService;
  }

  /**
   * Create a new todo
   * @summary Create a new todo item
   * @param requestBody Todo creation details
   */
  @Post('/')
  @SuccessResponse('201', 'Todo created successfully')
  @TsoaResponse<ErrorResponse>(
    '400',
    'Validation error - title is required and must be less than 200 chars'
  )
  public async createTodo(
    @Body() requestBody: CreateTodoDto
  ): Promise<SuccessDataResponse<TodoResponseDto>> {
    const dto = validateCreateTodoDto(requestBody);
    const todo = await this.todoService.createTodo(dto);
    this.setStatus(201);
    return {
      data: toTodoResponseDto(todo),
    };
  }

  /**
   * Get all todos
   * @summary Retrieve all todos, optionally filtered by userId
   * @param userId Optional user ID to filter todos
   */
  @Get('/')
  @SuccessResponse('200', 'Todos retrieved successfully')
  public async getAllTodos(
    @Query() userId?: string
  ): Promise<SuccessDataResponse<TodoResponseDto[]>> {
    const todos = userId
      ? await this.todoService.getTodosByUserId(userId)
      : await this.todoService.getAllTodos();

    return {
      data: todos.map(toTodoResponseDto),
    };
  }

  /**
   * Get todo by ID
   * @summary Retrieve a specific todo by ID
   * @param id Todo ID (UUID)
   */
  @Get('{id}')
  @SuccessResponse('200', 'Todo found')
  @TsoaResponse<ErrorResponse>('404', 'Todo not found')
  public async getTodoById(
    @Path() id: string
  ): Promise<SuccessDataResponse<TodoResponseDto>> {
    const todo = await this.todoService.getTodoById(id);
    return {
      data: toTodoResponseDto(todo),
    };
  }

  /**
   * Update todo by ID
   * @summary Update a todo item
   * @param id Todo ID (UUID)
   * @param requestBody Todo update details
   */
  @Put('{id}')
  @SuccessResponse('200', 'Todo updated successfully')
  @TsoaResponse<ErrorResponse>('400', 'Validation error')
  @TsoaResponse<ErrorResponse>('404', 'Todo not found')
  public async updateTodo(
    @Path() id: string,
    @Body() requestBody: UpdateTodoDto
  ): Promise<SuccessDataResponse<TodoResponseDto>> {
    const dto = validateUpdateTodoDto(requestBody);
    const todo = await this.todoService.updateTodo(id, dto);
    return {
      data: toTodoResponseDto(todo),
    };
  }

  /**
   * Delete todo by ID
   * @summary Delete a todo item
   * @param id Todo ID (UUID)
   */
  @Delete('{id}')
  @SuccessResponse('200', 'Todo deleted successfully')
  @TsoaResponse<ErrorResponse>('404', 'Todo not found')
  public async deleteTodo(@Path() id: string): Promise<SuccessMessageResponse> {
    await this.todoService.deleteTodo(id);
    return {
      message: 'Todo deleted successfully',
    };
  }

  /**
   * Reorder todo
   * @summary Reorder a todo item by updating its priority
   * @param id Todo ID (UUID)
   * @param requestBody Reorder details with new priority and userId
   */
  @Post('{id}/reorder')
  @SuccessResponse('200', 'Todo reordered successfully')
  @TsoaResponse<ErrorResponse>('400', 'Validation error')
  @TsoaResponse<ErrorResponse>('404', 'Todo not found')
  public async reorderTodo(
    @Path() id: string,
    @Body() requestBody: { priority: number; userId: string }
  ): Promise<SuccessMessageResponse> {
    const { priority, userId } = requestBody;

    if (typeof priority !== 'number' || typeof userId !== 'string') {
      throw {
        statusCode: 400,
        message: 'Priority must be a number and userId must be a string',
      };
    }

    await this.todoService.reorderTodo(id, priority, userId);
    return {
      message: 'Todo reordered successfully',
    };
  }

  /**
   * Move todo to a different list
   * @summary Move a todo item to another list
   * @param id Todo ID (UUID)
   * @param requestBody Move details with target listId
   */
  @Post('{id}/move')
  @SuccessResponse('200', 'Todo moved successfully')
  @TsoaResponse<ErrorResponse>('400', 'Validation error')
  @TsoaResponse<ErrorResponse>('404', 'Todo not found')
  public async moveToList(
    @Path() id: string,
    @Body() requestBody: { listId: string }
  ): Promise<SuccessDataResponse<TodoResponseDto>> {
    const { listId } = requestBody;

    if (!listId || typeof listId !== 'string') {
      throw {
        statusCode: 400,
        message: 'List ID must be a string',
      };
    }

    const todo = await this.todoService.moveToList(id, listId);
    return {
      data: toTodoResponseDto(todo),
    };
  }
}
