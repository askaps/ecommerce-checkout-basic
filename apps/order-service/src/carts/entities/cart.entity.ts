import { TCartProduct } from './cart-product.entity';

export class Cart {
  userId: string;
  couponCode: string | null;
  subTotal: number;
  discount: number;
  total: number;
  products: TCartProduct[] = [];
}

export type TCart = Cart & { id: string };
