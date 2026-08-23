import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ShoppingCart } from '../../core/models/shopping-cart';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  cart = signal<ShoppingCart | null>(null);

  itemCount = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  subtotal = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
  );

  private get cartId(): string {
    let id = localStorage.getItem('cart_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('cart_id', id);
    }
    return id;
  }

  getCart(): Observable<ShoppingCart> {
    const params = new HttpParams().set('id', this.cartId);

    return this.http.get<ShoppingCart>(`${this.baseUrl}/Cart`, { params }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  addItemToCart(productId: number, quantity: number): Observable<ShoppingCart> {
    const params = new HttpParams()
      .set('cartId', this.cartId)
      .set('productId', productId)
      .set('quantity', quantity);

    return this.http.post<ShoppingCart>(`${this.baseUrl}/Cart/items`, {}, { params }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  updateItemQuantity(productId: number, quantity: number): Observable<ShoppingCart> {
    const params = new HttpParams()
      .set('cartId', this.cartId)
      .set('quantity', quantity);

    return this.http.put<ShoppingCart>(`${this.baseUrl}/Cart/items/${productId}`, {}, { params }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  removeItem(productId: number): Observable<ShoppingCart> {
    const params = new HttpParams().set('cartId', this.cartId);

    return this.http.delete<ShoppingCart>(`${this.baseUrl}/Cart/items/${productId}`, { params }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  deleteCart(): Observable<void> {
    const params = new HttpParams().set('id', this.cartId);

    return this.http.delete<void>(`${this.baseUrl}/Cart`, { params }).pipe(
      tap(() => this.cart.set(null))
    );
  }
}
