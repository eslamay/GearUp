import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../../../core/models/product';
import { ProductParams } from '../../../core/models/product-params';
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component";
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop-list',
  imports: [CurrencyPipe, RouterLink,SpinnerComponent,ImageUrlPipe,FormsModule],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css'
})
export class ShopListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  brands: string[] = [];
  types: string[] = [];
  loading = true;

  resetToken = 0;

  productParams = new ProductParams();
  count = 0;

  searchTerm = '';
  private searchSubject = new Subject<string>();

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name' }
  ];

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilters();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.productParams.search = term;
      this.productParams.pageIndex = 1;
      this.loadProducts();
    });
  }

   loadFilters() {
    this.productService.getBrands().subscribe(brands => this.brands = brands);
    this.productService.getTypes().subscribe(types => this.types = types);
  }
  loadProducts() {
    this.loading = true;
    this.productService.getProducts(this.productParams).subscribe({
      next: (response) => {
        this.products = response.data;
        this.count = response.count;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  onSortChange(sort: string) {
    this.productParams.sort = sort;
    this.productParams.pageIndex = 1;
    this.loadProducts();
  }

  onBrandToggle(brand: string, checked: boolean) {
    if (checked) {
      this.productParams.brands.push(brand);
    } else {
      this.productParams.brands = this.productParams.brands.filter(b => b !== brand);
    }
    this.productParams.pageIndex = 1;
    this.loadProducts();
  }

  onTypeToggle(type: string, checked: boolean) {
    if (checked) {
      this.productParams.types.push(type);
    } else {
      this.productParams.types = this.productParams.types.filter(t => t !== type);
    }
    this.productParams.pageIndex = 1;
    this.loadProducts();
  }

  resetFilters() {
    this.productParams = new ProductParams();
    this.searchTerm = '';
    this.resetToken++;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.count / this.productParams.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.productParams.pageIndex = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
