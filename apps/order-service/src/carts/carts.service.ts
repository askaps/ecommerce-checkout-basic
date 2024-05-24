import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CheckedException, LoggerModule } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { CartsRepository } from './carts.repository';
import { Cart, TCart } from './entities/cart.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCartDto } from './dto/update-cart.dto';
import { TCartProduct } from './entities/cart-product.entity';
import { PatchCartDto } from './dto/patch-cart.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class CartsService {
  private logger = new LoggerModule(CartsService.name);

  constructor(
    readonly config: ConfigService,
    private readonly repository: CartsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly couponsService: CouponsService,
  ) {}

  /**
   * Creates a new cart with the provided context and user ID.
   *
   * @param ctx - The context of the request.
   * @param userId - The ID of the user creating the cart.
   * @returns A promise that resolves to the newly created cart.
   */
  async create(ctx: string, userId: string): Promise<TCart> {
    const cartId = `cart_${uuidv4()}`;

    const cartRequest: Partial<TCart> = {
      id: cartId,
      userId,
      subTotal: 0,
      discount: 0,
      total: 0,
    };

    // Create a new cart in the repository
    this.logger.info(ctx, `Creating new cart with id: ${cartId}`);
    return await this.repository.create(ctx, cartRequest);
  }

  /**
   * Gets a cart from the repository by its id.
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the cart's userId.
   * @param id - The id of the cart to retrieve.
   *
   * @returns A promise that resolves to the cart with the matching id and userId.
   */
  async get(ctx: string, userId: string, id: string): Promise<TCart> {
    // Retrieve the cart from the repository with the provided id
    const cart = await this.repository.get(ctx, id);

    if (!cart) {
      throw new CheckedException(`Cart with id: ${id} not found`, HttpStatus.NOT_FOUND, ctx);
    }

    // If the cart's userId does not match the userId in the request context
    // throw an UnauthorizedException
    if (cart.userId !== userId) {
      throw new UnauthorizedException();
    }

    // Return the cart
    return cart;
  }

  /**
   * Updates the cart with the provided data in the repository and retrieves the updated cart.
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user to match against the cart's userId.
   * @param id - The id of the cart to be updated.
   * @param request - The data to update the cart with.
   *
   * @returns A promise that resolves to the updated cart.
   */
  public async update(ctx: string, userId: string, id: string, request: UpdateCartDto): Promise<TCart> {
    this.logger.info(ctx, `Received update cart request, id: ${id}, payload: ${JSON.stringify(request)}`);

    // Retrieve the cart from the repository with the provided id
    let cart = await this.repository.get(ctx, id);

    if (!cart) {
      throw new CheckedException(`Cart with id: ${id} not found`, HttpStatus.NOT_FOUND, ctx);
    }

    // If the cart's userId does not match the userId in the request context
    // throw an UnauthorizedException
    if (cart.userId !== userId) {
      throw new UnauthorizedException();
    }

    if (request.products && Array.isArray(request.products) && request.products.length > 0) {
      const cartProducts: TCartProduct[] = this.prepareCartProducts(ctx, request);

      cart = {
        // Combine the existing cart data with the updated data
        ...cart,
        products: cartProducts,
      };

      cart = await this.calculateTotals(ctx, cart, cart.couponCode);

      this.logger.info(ctx, `Updating cart, id: ${id}, payload: ${JSON.stringify(cart)}`);

      // Update the cart in the repository with the provided data and retrieve the updated cart
      return await this.repository.update(ctx, id, cart);
    } else {
      return cart;
    }
  }

  /**
   * Prepares the cart products for update.
   *
   * This method takes the request payload and converts it into a format that can be used to update
   * the cart in the repository. The method iterates through the request's products array and for each
   * product, it creates a new CartProduct object with the product's id, name, quantity, price, subTotal,
   * and discount.
   *
   * @param ctx - The context of the request.
   * @param request - The request payload, which contains the products to update in the cart.
   * @returns An array of CartProduct objects that can be used to update the cart.
   */
  prepareCartProducts(ctx: string, request: UpdateCartDto): TCartProduct[] {
    const cartProducts: TCartProduct[] = [];

    request.products?.forEach((product) => {
      // get products data from store
      const cartProduct: TCartProduct = {
        id: product.id,
        name: `Product Name - ${product.id}`,
        quantity: product.quantity,
        price: 100, // TODO: Remove hardcoded value
        subTotal: product.quantity * 100, // TODO: Remove hardcoded value
        discount: 0,
      };
      cartProducts.push(cartProduct);
    });
    return cartProducts;
  }

  /**
   * Calculates the totals of a cart.
   *
   * @param ctx - The context of the request.
   * @param cart - The cart to calculate the totals for.Promise<TCart>
   * @param [couponCode] - The coupon code to apply to the cart.
   * @returns A promise that resolves to the cart.
   */
  async calculateTotals(ctx: string, cart: TCart, couponCode: string | null): Promise<TCart> {
    // Initialize  with  default value of 0
    const totals: Partial<Cart> = {
      subTotal: 0,
      discount: 0,
      total: 0,
    };

    // check coupon code validity
    if (couponCode) {
      cart = await this.applyCoupon(ctx, cart, couponCode);
    }

    // Iterate through the cart's products and add their subTotal and discount to the totals
    cart.products?.forEach((product) => {
      totals.subTotal += product.price * product.quantity;
      totals.discount += product.discount || 0;
    });

    // Calculate the total by subtracting the discount from the subTotal
    totals.total = totals.subTotal - totals.discount;

    return {
      // Combine the existing cart data with the updated totals
      ...cart,
      ...totals,
    };
  }

  /**
   * Applies a coupon code to the given cart, if it is valid and the current order should receive a discount.
   *
   * @param {string} ctx - The context of the request.
   * @param {TCart} cart - The cart to apply the coupon code to.
   * @param {string} couponCode - The coupon code to apply.
   * @return {Promise<TCart>} The updated cart with the applied coupon code and discounts.
   */
  async applyCoupon(ctx, cart: TCart, couponCode: string): Promise<TCart> {
    const couponValidity = await this.couponsService.get(ctx, couponCode);

    console.log(couponCode, couponValidity);

    const nthOrderDiscountCount = this.config.get<number>('nthOrderDiscountCount');

    // get previously saved order count
    const previousOrderCount = parseInt(await this.cacheManager.get('orderCount')) || 0;

    // get coupon discount value
    const nthOrderCouponValue = this.config.get<number>('nthOrderCouponValue');

    // check if previousOrderCount + 1 is divided by nthOrderDiscountCount
    // that is current order should get discount
    // TODO: apply rule engine to calculate discount
    if (couponValidity && (previousOrderCount + 1) % nthOrderDiscountCount === 0 && nthOrderCouponValue) {
      cart.products?.forEach((product) => {
        product.discount = product.subTotal / nthOrderCouponValue;
      });

      cart.couponCode = couponCode;
    } else {
      cart.couponCode = null;
    }
    return cart;
  }

  /**
   * Updates a cart with the provided id and request data.
   *
   * @param ctx - The context of the request.
   * @param userId - The id of the user making the request.
   * @param id - The id of the cart to be updated.
   * @param request - The data to update the cart with.
   * @return The updated cart.
   */
  public async patch(ctx: string, userId: string, id: string, request: PatchCartDto): Promise<TCart> {
    this.logger.info(ctx, `Received patch cart request, id: ${id}, payload: ${JSON.stringify(request)}`);

    // Retrieve the cart from the repository with the provided id
    let cart = await this.repository.get(ctx, id);

    if (!cart) {
      throw new CheckedException(`Cart with id: ${id} not found`, HttpStatus.NOT_FOUND, ctx);
    }

    // If the cart's userId does not match the userId in the request context
    // throw an UnauthorizedException
    if (cart.userId !== userId) {
      throw new UnauthorizedException();
    }

    if (request.couponCode) {
      cart = await this.calculateTotals(ctx, cart, request.couponCode);

      this.logger.info(ctx, `Updating cart, id: ${id}, payload: ${JSON.stringify(cart)}`);

      // Update the cart in the repository with the provided data and retrieve the updated cart
      return await this.repository.update(ctx, id, cart);
    } else {
      return cart;
    }
  }

  /**
   * Deletes a cart with the provided id.
   *
   * @param ctx - The context of the request.
   * @param id - The id of the cart to be deleted.
   * @return A promise that resolves to a boolean indicating if the cart was deleted.
   */
  public async delete(ctx: string, id: string): Promise<boolean> {
    // Log the received delete cart request
    this.logger.info(ctx, `Received delete cart request, id: ${id}`);

    // Delete the cart from the repository and return the result
    return await this.repository.delete(ctx, id);
  }
}
