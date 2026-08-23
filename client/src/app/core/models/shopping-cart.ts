import { CartItem } from './cart-item';

export interface ShoppingCart {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  clientSecret?: string;
  paymentIntentId?: string;
}

export type Cart = ShoppingCart;