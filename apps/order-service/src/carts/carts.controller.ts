import { Body, Controller, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReqUser } from '@app/auth';
import { CartsService } from './carts.service';
import { ApiResponse, ContextId } from '@app/shared';
import { TCart } from './entities/cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PatchCartDto } from './dto/patch-cart.dto';

@Controller('carts')
@ApiTags('Carts')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly service: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new cart with the provided context and user ID.' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, type: ApiResponse })
  /**
   * Creates a new cart with the provided context and user ID.
   *
   * @param ctx - The context of the request.
   * @param userId - The ID of the user creating the cart.
   * @returns A promise that resolves to the newly created cart.
   */
  public async create(@ContextId() ctx: string, @ReqUser('userId') userId: string): Promise<ApiResponse<TCart>> {
    const data = await this.service.create(ctx, userId);
    return new ApiResponse(data, HttpStatus.CREATED, ctx);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Gets a cart by ID.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, type: ApiResponse })
  @ApiParam({
    name: 'id',
    description: 'Cart Id',
    required: true,
    type: String,
  })
  /**
   * Gets a cart from the repository by its id.
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the cart's userId.
   * @param cartId - The id of the cart to retrieve.
   *
   * @returns A promise that resolves to the cart with the matching id and userId.
   */
  public async get(
    @ContextId() ctx: string,
    @ReqUser('userId') userId: string,
    @Param('id') cartId: string,
  ): Promise<ApiResponse<TCart>> {
    const data = await this.service.get(ctx, userId, cartId);
    return new ApiResponse(data, HttpStatus.OK, ctx);
  }

  @Post('/:id')
  @ApiOperation({ summary: 'Updates a cart by ID.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, type: ApiResponse })
  @ApiParam({
    name: 'id',
    description: 'Cart Id',
    required: true,
    type: String,
  })
  /**
   * Updates the cart with the provided data in the repository and retrieves the updated cart.
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the cart's userId.
   * @param cartId - The id of the cart to be updated.
   * @param request - The data to update the cart with.
   *
   * @returns A promise that resolves to the updated cart.
   */
  public async update(
    @ContextId() ctx: string,
    @ReqUser('userId') userId: string,
    @Param('id') cartId: string,
    @Body() request: UpdateCartDto,
  ): Promise<ApiResponse<TCart>> {
    const data = await this.service.update(ctx, userId, cartId, request);
    return new ApiResponse(data, HttpStatus.OK, ctx);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Applies partial modifications to a cart by ID.' })
  @SwaggerApiResponse({ status: HttpStatus.OK, type: ApiResponse })
  @ApiParam({
    name: 'id',
    description: 'Cart Id',
    required: true,
    type: String,
  })
  /**
   * Applies partial modifications to a cart by ID like applying coupon
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the cart's userId.
   * @param cartId - The id of the cart to be updated.
   * @param request - The data to patch the cart with.
   *
   * @returns A promise that resolves to the updated cart.
   */
  public async patch(
    @ContextId() ctx: string,
    @ReqUser('userId') userId: string,
    @Param('id') cartId: string,
    @Body() request: PatchCartDto,
  ): Promise<ApiResponse<TCart>> {
    const data = await this.service.patch(ctx, userId, cartId, request);
    return new ApiResponse(data, HttpStatus.OK, ctx);
  }
}
