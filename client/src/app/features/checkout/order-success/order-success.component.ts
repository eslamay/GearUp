import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../checkout.service';
import { OrderDto } from '../../../core/models/order';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, SpinnerComponent],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private checkoutService = inject(CheckoutService);

  order: OrderDto | null = null;
  loading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.checkoutService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}