export class OrderProduct {
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
  discount: number;
}

export type TOrderProduct = OrderProduct & { id: string };
