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
import { ListService } from '../services/list.service';
import { CreateListDto, validateCreateListDto } from '../dto/create-list.dto';
import { UpdateListDto, validateUpdateListDto } from '../dto/update-list.dto';
import { ListResponseDto, toListResponseDto } from '../dto/list-response.dto';
import type {
  SuccessDataResponse,
  SuccessMessageResponse,
  ErrorResponse,
} from '../types/responses';

@Route('lists')
@Tags('Lists')
export class ListController extends Controller {
  private listService: ListService;

  constructor(listService: ListService) {
    super();
    this.listService = listService;
  }

  /**
   * Create a new list
   * @summary Create a new list
   * @param requestBody List creation details
   */
  @Post('/')
  @SuccessResponse('201', 'List created successfully')
  @TsoaResponse<ErrorResponse>(
    '400',
    'Validation error - name is required and must be less than 50 chars'
  )
  public async createList(
    @Body() requestBody: CreateListDto
  ): Promise<SuccessDataResponse<ListResponseDto>> {
    const dto = validateCreateListDto(requestBody);
    const list = await this.listService.createList(dto);
    this.setStatus(201);
    return {
      data: toListResponseDto(list),
    };
  }

  /**
   * Get all lists
   * @summary Retrieve all lists, optionally filtered by userId
   * @param userId Optional user ID to filter lists
   */
  @Get('/')
  @SuccessResponse('200', 'Lists retrieved successfully')
  public async getAllLists(
    @Query() userId?: string
  ): Promise<SuccessDataResponse<ListResponseDto[]>> {
    const lists = userId
      ? await this.listService.getListsByUserId(userId)
      : await this.listService.getAllLists();

    return {
      data: lists.map(toListResponseDto),
    };
  }

  /**
   * Get list by ID
   * @summary Retrieve a specific list by ID
   * @param id List ID (UUID)
   */
  @Get('{id}')
  @SuccessResponse('200', 'List found')
  @TsoaResponse<ErrorResponse>('404', 'List not found')
  public async getListById(
    @Path() id: string
  ): Promise<SuccessDataResponse<ListResponseDto>> {
    const list = await this.listService.getListById(id);
    return {
      data: toListResponseDto(list),
    };
  }

  /**
   * Update list by ID
   * @summary Update a list
   * @param id List ID (UUID)
   * @param requestBody List update details
   */
  @Put('{id}')
  @SuccessResponse('200', 'List updated successfully')
  @TsoaResponse<ErrorResponse>('400', 'Validation error')
  @TsoaResponse<ErrorResponse>('404', 'List not found')
  public async updateList(
    @Path() id: string,
    @Body() requestBody: UpdateListDto
  ): Promise<SuccessDataResponse<ListResponseDto>> {
    const dto = validateUpdateListDto(requestBody);
    const list = await this.listService.updateList(id, dto);
    return {
      data: toListResponseDto(list),
    };
  }

  /**
   * Delete list by ID
   * @summary Delete a list
   * @param id List ID (UUID)
   * @param userId User ID for ownership validation
   */
  @Delete('{id}')
  @SuccessResponse('200', 'List deleted successfully')
  @TsoaResponse<ErrorResponse>('400', 'Cannot delete list with todos')
  @TsoaResponse<ErrorResponse>('404', 'List not found')
  public async deleteList(
    @Path() id: string,
    @Query() userId: string
  ): Promise<SuccessMessageResponse> {
    if (!userId || typeof userId !== 'string') {
      throw {
        statusCode: 400,
        message: 'User ID is required for list deletion',
      };
    }

    await this.listService.deleteList(id, userId);
    return {
      message: 'List deleted successfully',
    };
  }

  /**
   * Reorder list
   * @summary Reorder a list by updating its priority
   * @param id List ID (UUID)
   * @param requestBody Reorder details with new priority and userId
   */
  @Post('{id}/reorder')
  @SuccessResponse('200', 'List reordered successfully')
  @TsoaResponse<ErrorResponse>('400', 'Validation error')
  @TsoaResponse<ErrorResponse>('404', 'List not found')
  public async reorderList(
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

    await this.listService.reorderList(id, priority, userId);
    return {
      message: 'List reordered successfully',
    };
  }
}
