import { Injectable } from '@nestjs/common';
import { LoggerModule } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { CouponsRepository } from './coupons.repository';

@Injectable()
export class CouponsService {
  private logger = new LoggerModule(CouponsService.name);

  constructor(readonly config: ConfigService, private readonly repository: CouponsRepository) {}

  /**
   * Creates a new coupon with the given code.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} code - The code for the coupon.
   * @return {Promise<string>} - A promise that resolves to the ID of the created coupon.
   * @throws {Error} - If an error occurs during the creation of the coupon.
   */
  async create(ctx: string, code: string): Promise<string> {
    try {
      this.logger.info(ctx, `Creating new code with code: ${code}`);

      const coupon = await this.repository.create(ctx, code);

      return coupon;
    } catch (error) {
      throw error;
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
      return await this.repository.create(ctx, code);
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
}
