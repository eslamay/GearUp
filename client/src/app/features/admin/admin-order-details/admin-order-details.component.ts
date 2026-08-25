import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../admin.service';
import { OrderDto } from '../../../core/models/order';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, SpinnerComponent, ImageUrlPipe, ConfirmDialogComponent],
  templateUrl: './admin-order-details.component.html',
  styleUrl: './admin-order-details.component.css'
})
export class AdminOrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  order: OrderDto | null = null;
  loading = true;
  notFound = false;

  showRefundConfirm = false;
  refunding = false;
  refundError: string | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.adminService.getOrderById(id).subscribe({
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

  openRefundConfirm() {
    this.showRefundConfirm = true;
  }

  onRefundConfirmed(confirmed: boolean) {
    this.showRefundConfirm = false;
    if (!confirmed || !this.order) return;

    this.refunding = true;
    this.refundError = null;

    this.adminService.refundOrder(this.order.id).subscribe({
      next: (order) => {
        this.order = order;
        this.refunding = false;
      },
      error: (err) => {
        this.refunding = false;
        this.refundError = typeof err.error === 'string' ? err.error : 'Could not refund this order.';
      }
    });
  }
}