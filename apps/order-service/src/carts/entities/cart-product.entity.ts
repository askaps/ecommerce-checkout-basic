export class CartProduct {
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
  discount: number;
}

export type TCartProduct = CartProduct & { id: string };
