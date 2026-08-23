import { Component, inject, OnInit } from '@angular/core';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../product.service';
import { Product } from '../../../core/models/product';
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { AccountService } from '../../account/account.service';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe, RouterLink, SpinnerComponent, ImageUrlPipe, ConfirmDialogComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private accountService = inject(AccountService);
  private cartService = inject(CartService);

  product: Product | null = null;
  loading = true;
  notFound = false;

  quantity = 1;
  showDeleteConfirm = false;
  deleting = false;

  addingToCart = false;
  addedMessage = false;
  cartErrorMessage: string | null = null;

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
    if (!this.product) return;

    this.addingToCart = true;
    this.cartErrorMessage = null;
    this.addedMessage = false;

    this.cartService.addItemToCart(this.product.id, this.quantity).subscribe({
      next: () => {
        this.addingToCart = false;
        this.addedMessage = true;
        setTimeout(() => (this.addedMessage = false), 2000);
      },
      error: (err) => {
        this.addingToCart = false;
        this.cartErrorMessage = typeof err.error === 'string'
          ? err.error
          : 'Could not add item to cart.';
      }
    });
  }

  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(confirmed: boolean) {
    this.showDeleteConfirm = false;

    if (!confirmed || !this.product) return;

    this.deleting = true;
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.router.navigateByUrl('/shop');
      },
      error: () => {
        this.deleting = false;
      }
    });
  }

  get canManageProduct(): boolean {
  const user = this.accountService.currentUser();
  if (!user || !this.product) return false;

  return user.roles === 'Admin' || this.product.vendor?.userName === user.userName;
}
}
