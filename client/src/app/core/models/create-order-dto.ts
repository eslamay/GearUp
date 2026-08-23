import { ShippingAddress } from './shipping-address';
import { PaymentSummary } from './payment-summary';

export interface CreateOrderDto {
  cartId: string;
  deliveryMethodId: number;
  shippingAddress: ShippingAddress;
  paymentSummary: PaymentSummary;
  discount: number;
}