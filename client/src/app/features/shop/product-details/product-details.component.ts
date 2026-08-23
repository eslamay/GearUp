import { Component, inject, OnInit } from '@angular/core';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../product.service';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe, RouterLink, SpinnerComponent, ImageUrlPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product: Product | null = null;
  loading = true;
  notFound = false;

  quantity = 1;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  increaseQty() {
    if (this.product && this.quantity < this.product.quantityInStock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    // TODO Later
    console.log('Add to cart:', this.product?.id, 'Qty:', this.quantity);
  }
}
