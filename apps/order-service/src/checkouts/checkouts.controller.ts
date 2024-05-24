import { Controller, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReqUser } from '@app/auth';
import { CheckoutsService } from './checkouts.service';
import { ApiResponse, ContextId } from '@app/shared';
import { TOrder } from './entities/order.entity';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('v1/checkouts')
@ApiTags('Checkouts')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class CheckoutsController {
  constructor(private readonly service: CheckoutsService) {}

  @Post('/:cartId')
  @ApiOperation({ summary: 'Create a new order by cartId.' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, type: ApiResponse })
  @ApiParam({
    name: 'cartId',
    description: 'Cart Id',
    required: true,
    type: String,
  })
  /**
   * Create a new order with the provided cartId
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the order userId.
   * @param cartId - The id of the cart to be updated.
   *
   * @returns A promise that resolves to the new order.
   */
  public async create(
    @ContextId() ctx: string,
    @ReqUser('userId') userId: string,
    @Param('cartId') cartId: string,
  ): Promise<ApiResponse<TOrder>> {
    const data = await this.service.create(ctx, userId, cartId);
    return new ApiResponse(data, HttpStatus.CREATED, ctx);
  }
}
