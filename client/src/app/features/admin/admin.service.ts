import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Product } from '../../core/models/product';
import { ProductParams } from '../../core/models/product-params';
import { OrderSpecParams } from '../../core/models/order-spec-params';
import { Pagination } from '../../core/models/pagination';
import { OrderDto } from '../../core/models/order';
import { AdminDashboardDto, SalesOverTimeItem, VendorSummary } from '../../core/models/admin-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getDashboard(): Observable<AdminDashboardDto> {
    return this.http.get<AdminDashboardDto>(`${this.baseUrl}/Admin/dashboard`);
  }

  getSalesOverTime(): Observable<SalesOverTimeItem[]> {
    return this.http.get<SalesOverTimeItem[]>(`${this.baseUrl}/Admin/sales-over-time`);
  }

  getAllProducts(productParams: ProductParams): Observable<Pagination<Product>> {
    let params = new HttpParams()
      .set('pageIndex', productParams.pageIndex)
      .set('pageSize', productParams.pageSize);

    if (productParams.status) params = params.set('status', productParams.status);
    if (productParams.search) params = params.set('search', productParams.search);
    if (productParams.sort) params = params.set('sort', productParams.sort);
    if (productParams.brands.length) params = params.set('brands', productParams.brands.join(','));
    if (productParams.types.length) params = params.set('types', productParams.types.join(','));

    return this.http.get<Pagination<Product>>(`${this.baseUrl}/Admin/products`, { params });
  }

  approveProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/Admin/products/${id}/approve`, {});
  }

  rejectProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/Admin/products/${id}/reject`, {});
  }

  suspendProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/Admin/products/${id}/suspend`, {});
  }

  getOrders(orderParams: OrderSpecParams): Observable<Pagination<OrderDto>> {
    let params = new HttpParams()
      .set('pageIndex', orderParams.pageIndex)
      .set('pageSize', orderParams.pageSize);

    if (orderParams.status) params = params.set('status', orderParams.status);

    return this.http.get<Pagination<OrderDto>>(`${this.baseUrl}/Admin/orders`, { params });
  }

  getOrderById(id: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.baseUrl}/Admin/orders/${id}`);
  }

  refundOrder(id: number): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.baseUrl}/Admin/orders/refund/${id}`, {});
  }

  getVendors(): Observable<VendorSummary[]> {
    return this.http.get<VendorSummary[]>(`${this.baseUrl}/Admin/vendors`);
  }

  getVendorsCount(): Observable<{ totalVendors: number }> {
    return this.http.get<{ totalVendors: number }>(`${this.baseUrl}/Admin/vendors/count`);
  }
}