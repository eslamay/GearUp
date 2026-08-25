import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { Product } from '../../core/models/product';
import { OrderDto } from '../../core/models/order';
import { Pagination } from '../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getPendingProducts(): Observable<Product[]> {
  return this.http
    .get<Pagination<Product>>(`${this.baseUrl}/Admin/products`, {
      params: {
        Status: 'Pending'
      }
    })
    .pipe(
      map(response => response.data)
    );
}

  approveProduct(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Admin/products/${id}/approve`, {});
  }

  rejectProduct(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Admin/products/${id}/reject`, {});
  }

  getAllOrders(): Observable<OrderDto[]> {
    return this.http
      .get<Pagination<OrderDto>>(`${this.baseUrl}/Admin/orders`)
      .pipe(
        map(response => response.data)
      );
  }
}