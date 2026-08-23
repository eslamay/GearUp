import { ShippingAddress } from './shipping-address';
import { PaymentSummary } from './payment-summary';
import { OrderItemDto } from './order-item';

export interface OrderDto {
  id: number;
  orderDate: string;
  buyerEmail: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  paymentSummary: PaymentSummary;
  shippingPrice: number;
  orderItems: OrderItemDto[];
  subtotal: number;
  discount: number;
  status: string;
  total: number;
  paymentIntentId: string;
}