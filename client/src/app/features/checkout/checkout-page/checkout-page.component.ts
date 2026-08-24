import { Component, inject, OnInit } from '@angular/core';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, RouterLink, SpinnerComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent implements OnInit {
  cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);

  loading = true;

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.loading = false;

        if (!cart || cart.items.length === 0) {
          this.router.navigateByUrl('/cart');
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigateByUrl('/cart');
      }
    });
  }
}