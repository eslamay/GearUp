import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../../../core/models/product';
import { ProductParams } from '../../../core/models/product-params';
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component";
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-shop-list',
  imports: [CurrencyPipe, RouterLink,SpinnerComponent,ImageUrlPipe],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css'
})
export class ShopListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  loading = true;

  productParams = new ProductParams();
  count = 0;

  ngOnInit(): void {
    this.loadProducts();
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
