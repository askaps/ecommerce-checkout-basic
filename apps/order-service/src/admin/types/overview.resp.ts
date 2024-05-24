import { OrderProduct } from '../../checkouts/entities/order-product.entity';
import { Order } from '../../checkouts/entities/order.entity';

export class OverviewResponse {
  orders: {
    totalAmount: number;
    totalDiscountAmount: number;
    count: number;
    data: Order[];
  };
  products: {
    count: number;
    data: OrderProduct[];
  };
  coupons: {
    count: number;
    data: string[];
  };
}
