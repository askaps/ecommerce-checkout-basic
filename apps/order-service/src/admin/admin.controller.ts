import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@app/auth';
import { AdminService } from './admin.service';
import { ApiResponse, ContextId } from '@app/shared';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OverviewResponse } from './types/overview.resp';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';

@Controller('admin/v1')
@ApiTags('Admin')
@UseGuards(AuthGuard(), RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly service: AdminService) {}

  /**
   * Retrieves an overview of the data.
   *
   * @param {string} ctx - The context ID.
   * @return {Promise<ApiResponse<OverviewResponse>>} - A promise that resolves to an API response containing the overview data.
   */
  @ApiOperation({
    summary: 'Retrieves orders, orderProducts and discounts with totalAmount ordered, totalDiscountAmount ',
  })
  @ApiOkResponse({ type: ApiResponse })
  @Get('overview')
  public async overview(@ContextId() ctx: string): Promise<ApiResponse<OverviewResponse>> {
    // Call the overview() method of the AdminService to retrieve the data.
    const data = await this.service.overview(ctx);
    // Create a new ApiResponse object with the data, HTTP status code, and context ID.
    return new ApiResponse(data, HttpStatus.OK, ctx);
  }

  @Post('create-coupon')
  @ApiOperation({ summary: 'Creates a new coupon' })
  @ApiOkResponse({ status: HttpStatus.CREATED, type: ApiResponse })
  /**
   * Creates a new coupon.
   *
   * @param ctx - The context of the request.
   * @param userId - The ID of the user creating the cart.
   * @returns A promise that resolves to the newly created cart.
   */
  public async createCoupon(
    @ContextId() ctx: string,
    @Body() request: CreateCouponDto,
  ): Promise<ApiResponse<{ code: string }>> {
    const data = await this.service.createCoupon(ctx, request);
    return new ApiResponse(data, HttpStatus.CREATED, ctx);
  }
}
