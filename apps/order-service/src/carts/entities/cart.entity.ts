import { TCartProduct } from './cart-product.entity';

export class Cart {
  userId: string;
  subTotal: number;
  discount: number;
  total: number;
  products: TCartProduct[] = [];
}

export type TCart = Cart & { id: string };
