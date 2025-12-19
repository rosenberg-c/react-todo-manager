import {
  Controller,
  Route,
  Post,
  Get,
  Delete,
  Body,
  Path,
  SuccessResponse,
  Response as TsoaResponse,
  Tags,
} from 'tsoa';
import { UserService } from '../services/user.service';
import { CreateUserDto, validateCreateUserDto } from '../dto/create-user.dto';
import { LoginDto, validateLoginDto } from '../dto/login.dto';
import { UserResponseDto, toUserResponseDto } from '../dto/user-response.dto';

interface SuccessDataResponse<T> {
  data: T;
}

interface SuccessMessageResponse {
  message: string;
}

interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
  };
}

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  private userService: UserService;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  /**
   * Create a new user
   * @summary Create a new user account
   * @param requestBody User registration details
   */
  @Post('/')
  @SuccessResponse('201', 'User created successfully')
  @TsoaResponse<ErrorResponse>(
    '400',
    'Validation error - username must be 3-50 chars, password must be 8+ chars'
  )
  @TsoaResponse<ErrorResponse>('409', 'Conflict - username already exists')
  public async createUser(
    @Body() requestBody: CreateUserDto
  ): Promise<SuccessDataResponse<UserResponseDto>> {
    const dto = validateCreateUserDto(requestBody);
    const user = await this.userService.createUser(dto);
    this.setStatus(201);
    return {
      data: toUserResponseDto(user),
    };
  }

  /**
   * Get all users
   * @summary Retrieve all users
   */
  @Get('/')
  @SuccessResponse('200', 'Users retrieved successfully')
  public async getAllUsers(): Promise<SuccessDataResponse<UserResponseDto[]>> {
    const users = await this.userService.getAllUsers();
    return {
      data: users.map(toUserResponseDto),
    };
  }

  /**
   * Get user by ID
   * @summary Retrieve user information by ID
   * @param id User ID (UUID)
   */
  @Get('{id}')
  @SuccessResponse('200', 'User found')
  @TsoaResponse<ErrorResponse>('404', 'User not found')
  public async getUserById(
    @Path() id: string
  ): Promise<SuccessDataResponse<UserResponseDto>> {
    const user = await this.userService.getUserById(id);
    return {
      data: toUserResponseDto(user),
    };
  }

  /**
   * Delete user by ID
   * @summary Delete a user account
   * @param id User ID (UUID)
   */
  @Delete('{id}')
  @SuccessResponse('200', 'User deleted successfully')
  @TsoaResponse<ErrorResponse>('404', 'User not found')
  public async deleteUser(@Path() id: string): Promise<SuccessMessageResponse> {
    await this.userService.deleteUser(id);
    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Login user
   * @summary Authenticate a user with username and password
   * @param requestBody Login credentials
   */
  @Post('/login')
  @SuccessResponse('200', 'Login successful')
  @TsoaResponse<ErrorResponse>(
    '400',
    'Validation error - Invalid username or password'
  )
  public async login(
    @Body() requestBody: LoginDto
  ): Promise<SuccessDataResponse<UserResponseDto>> {
    const dto = validateLoginDto(requestBody);
    const user = await this.userService.login(dto);
    return {
      data: toUserResponseDto(user),
    };
  }
}
