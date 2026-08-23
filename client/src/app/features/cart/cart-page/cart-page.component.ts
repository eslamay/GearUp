import { Component, inject, OnInit } from '@angular/core';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../cart.service';
import { CartItem } from '../../../core/models/cart-item';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, RouterLink, ImageUrlPipe, ConfirmDialogComponent, SpinnerComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent implements OnInit {
  cartService = inject(CartService);

  loading = true;
  updatingProductId: number | null = null;
  showClearConfirm = false;

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false)
    });
  }

  increaseQty(item: CartItem) {
    this.updatingProductId = item.productId;
    this.cartService.updateItemQuantity(item.productId, item.quantity + 1).subscribe({
      next: () => (this.updatingProductId = null),
      error: () => (this.updatingProductId = null)
    });
  }

  decreaseQty(item: CartItem) {
    if (item.quantity <= 1) return;

    this.updatingProductId = item.productId;
    this.cartService.updateItemQuantity(item.productId, item.quantity - 1).subscribe({
      next: () => (this.updatingProductId = null),
      error: () => (this.updatingProductId = null)
    });
  }

  removeItem(productId: number) {
    this.updatingProductId = productId;
    this.cartService.removeItem(productId).subscribe({
      next: () => (this.updatingProductId = null),
      error: () => (this.updatingProductId = null)
    });
  }

  openClearConfirm() {
    this.showClearConfirm = true;
  }

  onClearConfirmed(confirmed: boolean) {
    this.showClearConfirm = false;
    if (!confirmed) return;

    this.cartService.deleteCart().subscribe();
  }
}
