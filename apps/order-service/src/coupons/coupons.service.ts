import { HttpStatus, Injectable } from '@nestjs/common';
import { CheckedException, LoggerModule } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  private logger = new LoggerModule(CouponsService.name);

  constructor(readonly config: ConfigService, private readonly repository: CouponsRepository) {}

  /**
   * Creates a new coupon with the given code.
   *
   * @param {string} ctx - The context of the request.
   * @param {CreateCouponDto} request - The code for the coupon.
   * @return {Promise<string>} - A promise that resolves to the ID of the created coupon.
   * @throws {Error} - If an error occurs during the creation of the coupon.
   */
  async create(ctx: string, request: CreateCouponDto): Promise<{ code: string }> {
    try {
      this.logger.info(ctx, `Creating new code with code: ${request.code}`);

      const coupon = await this.repository.create(ctx, request);

      return { code: coupon };
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }

  /**
   * Retrieves a coupon code from the repository.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} code - The code of the coupon to retrieve.
   * @returns {Promise<string | null>} - A promise that resolves to the coupon ID if found, or null if not found.
   * @throws {Error} - If an error occurs during the retrieval of the coupon.
   */
  async get(ctx: string, code: string): Promise<string | null> {
    try {
      return await this.repository.get(ctx, code);
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }

  /**
   * Deletes a coupon code from the repository.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} code - The code of the coupon to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if the coupon was deleted, false otherwise.
   * @throws {Error} - If an error occurs during the deletion of the coupon.
   */
  async delete(ctx: string, code: string): Promise<boolean> {
    try {
      this.logger.info(ctx, `Deleting coupon code with code: ${code}`);

      // Delete the coupon code from the repository
      return await this.repository.delete(ctx, code);
    } catch (error) {
      // Rethrow the error to be handled by the calling code
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }

  /**
   * Retrieves all coupons from the repository.
   *
   * @param ctx - The context of the request.
   * @returns A promise that resolves to an array of coupons.
   * @throws If there is an error retrieving the coupons.
   */
  async getAll(ctx: string): Promise<string[]> {
    try {
      return await this.repository.getAll(ctx);
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }
}
