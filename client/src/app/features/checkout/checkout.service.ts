import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryMethod } from '../../core/models/delivery-method';
import { CreateOrderDto } from '../../core/models/create-order-dto';
import { OrderDto } from '../../core/models/order';
import { ShoppingCart } from '../../core/models/shopping-cart';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getOrderById(id: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.baseUrl}/Orders/${id}`);
  }

  getOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.baseUrl}/Orders`);
  }

  getDeliveryMethods(): Observable<DeliveryMethod[]> {
    return this.http.get<DeliveryMethod[]>(
      `${this.baseUrl}/Orders/delivery-methods`,
    );
  }

  createOrder(orderDto: CreateOrderDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.baseUrl}/Orders`, orderDto);
  }

  createOrUpdatePaymentIntent(cartId: string): Observable<ShoppingCart> {
    return this.http.post<ShoppingCart>(
      `${this.baseUrl}/Payments/${cartId}`,
      {},
    );
  }
}
