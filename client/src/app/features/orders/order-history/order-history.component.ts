import { Component, OnInit, inject } from '@angular/core';
import { CheckoutService } from '../../checkout/checkout.service';
import { OrderDto } from '../../../core/models/order';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [SpinnerComponent, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  private checkoutService = inject(CheckoutService);

  orders: OrderDto[] = [];
  loading = true;

  ngOnInit() {
    this.checkoutService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}