import { HttpStatus, Injectable } from '@nestjs/common';
import { CheckoutsService } from '../checkouts/checkouts.service';
import { OverviewResponse } from './types/overview.resp';
import { CouponsService } from '../coupons/coupons.service';
import { TOrderProduct } from '../checkouts/entities/order-product.entity';
import { CheckedException } from '@app/shared';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';

@Injectable()
export class AdminService {
  constructor(private readonly checkoutsService: CheckoutsService, private readonly couponsService: CouponsService) {}

  /**
   * Retrieves an overview of orders, products, and coupons.
   *
   * @param {string} ctx - The context of the request.
   * @return {Promise<OverviewResponse>} The overview response containing the orders, products, and coupons.
   * @throws {Error} If an error occurs during the request.
   */
  async overview(ctx: string): Promise<OverviewResponse> {
    try {
      // Retrieve all orders and coupons concurrently
      const [orders, coupons] = await Promise.all([this.checkoutsService.getAll(ctx), this.couponsService.getAll(ctx)]);

      let totalAmount = 0; // The total amount of all orders
      let totalDiscountAmount = 0; // The total discount amount of all orders
      let productsCount = 0; // The total count of products in all orders
      const products: TOrderProduct[] = []; // The list of all products in all orders

      // Iterate through each order and update the corresponding variables
      orders.forEach((order) => {
        totalAmount += +order.total;
        totalDiscountAmount += +order.discount;
        productsCount += +order.products.length;
        products.push(...order.products);
      });

      const response: OverviewResponse = {
        orders: {
          totalAmount,
          totalDiscountAmount,
          count: orders.length,
          data: orders,
        },
        products: {
          count: productsCount,
          data: products,
        },
        coupons: {
          count: coupons.length,
          data: coupons,
        },
      };

      return response;
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }

  /**
   * Creates a new coupon with the given coupon code.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} couponCode - The code for the coupon.
   * @return {Promise<string>} A promise that resolves to the ID of the newly created coupon.
   * @throws {CheckedException} If an error occurs during the request.
   */
  async createCoupon(ctx: string, request: CreateCouponDto): Promise<{ code: string }> {
    try {
      // Call the coupons service to create the coupon with the provided code
      return await this.couponsService.create(ctx, request);
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }
}
