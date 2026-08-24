import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../../checkout/checkout.service';
import { OrderDto } from '../../../core/models/order';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, SpinnerComponent, ImageUrlPipe],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private checkoutService = inject(CheckoutService);

  order: OrderDto | null = null;
  loading = true;
  notFound = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.checkoutService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }
}