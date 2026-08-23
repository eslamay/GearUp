import { CartItem } from './cart-item';

export interface AppCoupon {
  name: string;
  couponId: string;
  promotionCode?: string;
  amountOff?: number;
  percentOff?: number;
}

export interface ShoppingCart {
  id: string;
  items: CartItem[];
  deliveryMethodId: number | null;
  clientSecret: string | null;
  paymentIntentId: string | null;
  coupon: AppCoupon | null;
}