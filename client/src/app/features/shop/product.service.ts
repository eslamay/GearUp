import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../../core/models/pagination';
import { Product } from '../../core/models/product';
import { ProductParams } from '../../core/models/product-params';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getProducts(productParams: ProductParams): Observable<Pagination<Product>> {
    let params = new HttpParams();

    if (productParams.brands.length > 0) {
      params = params.append('brands', productParams.brands.join(','));
    }
    if (productParams.types.length > 0) {
      params = params.append('types', productParams.types.join(','));
    }
    if (productParams.search) {
      params = params.append('search', productParams.search);
    }
    if (productParams.sort) {
      params = params.append('sort', productParams.sort);
    }

    params = params.append('pageIndex', productParams.pageIndex);
    params = params.append('pageSize', productParams.pageSize);

    return this.http.get<Pagination<Product>>(`${this.baseUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/brands`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/types`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}
