import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Creates a new coupon code and stores it in the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param {CreateCouponDto} request - The coupon code to add.
   * @return {Promise<string>} - A promise that resolves to the added coupon code.
   */
  async create(ctx: string, request: CreateCouponDto): Promise<string> {
    // Get the list of coupons from the cache. If it doesn't exist, create an empty array.
    const coupons: string[] = (await this.cacheManager.get('coupons')) || [];

    // Add the new coupon code to the array.
    coupons.push(request.code);

    // Store the updated list of coupons in the cache with a TTL of 1 year (365 days).
    await this.cacheManager.set('coupons', coupons, 365 * 3600 * 1000);

    // Return the added coupon code.
    return request.code;
  }

  /**
   * Retrieves a coupon code from the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} code - The code of the coupon to retrieve.
   * @return {Promise<string | null>} - A promise that resolves to the coupon code if found,
   * or null if not found.
   */
  async get(ctx: string, code: string): Promise<string | null> {
    // Get the list of coupons from the cache.
    const coupons: string[] = (await this.cacheManager.get('coupons')) || [];

    // Return the coupon code if found, or null if not found.
    return coupons.includes(code) ? code : null;
  }

  /**
   * Deletes a coupon code from the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} code - The code of the coupon to delete.
   * @return {Promise<boolean>} - A promise that resolves to true if the coupon was deleted,
   * or false if the coupon was not found.
   */
  async delete(ctx: string, code: string): Promise<boolean> {
    // Get the list of coupons from the cache.
    const coupons: string[] = (await this.cacheManager.get('coupons')) || [];

    // Filter out the coupon code to delete.
    const filteredCoupons = coupons.filter((e) => e !== code);

    // Store the updated list of coupons in the cache with a TTL of 1 year (365 days).
    await this.cacheManager.set('coupons', filteredCoupons, 365 * 3600 * 1000);

    // Return true if the coupon was deleted, or false if the coupon was not found.
    return coupons.includes(code) ? true : false;
  }

  /**
   * Retrieves all coupons from the cache.
   *
   * @param {string} ctx - The context of the request.
   * @return {Promise<string[]>} A promise that resolves to an array of coupons.
   */
  async getAll(ctx: string): Promise<string[]> {
    return (await this.cacheManager.get('coupons')) || [];
  }
}
