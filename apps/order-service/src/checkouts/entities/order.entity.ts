import { TOrderProduct } from './order-product.entity';

export class Order {
  userId: string;
  couponCode: string | null;
  subTotal: number;
  discount: number;
  total: number;
  products: TOrderProduct[] = [];
}

export type TOrder = Order & { id: string };
