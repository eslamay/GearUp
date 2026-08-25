import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Product } from '../../core/models/product';
import { ProductParams } from '../../core/models/product-params';
import { Pagination } from '../../core/models/pagination';
import { VendorDashboardDto } from '../../core/models/vendor-dashboard';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMyProducts(productParams: ProductParams): Observable<Pagination<Product>> {
    let params = new HttpParams()
      .set('pageIndex', productParams.pageIndex)
      .set('pageSize', productParams.pageSize);

    return this.http.get<Pagination<Product>>(`${this.baseUrl}/Vendor/products`, { params });
  }

  getMyProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/Vendor/products/${id}`);
  }

  getDashboard(): Observable<VendorDashboardDto> {
    return this.http.get<VendorDashboardDto>(`${this.baseUrl}/Vendor/dashboard`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/Vendor/products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/Vendor/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Vendor/products/${id}`);
  }
}