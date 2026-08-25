import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService } from '../vendor.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { VendorDashboardDto } from '../../../core/models/vendor-dashboard';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink,NgClass, SpinnerComponent, ImageUrlPipe, ConfirmDialogComponent],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.css'
})
export class VendorDashboardComponent implements OnInit {
  private vendorService = inject(VendorService);

  dashboard: VendorDashboardDto | null = null;
  loading = true;

  deleteTargetId: number | null = null;

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.vendorService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openDeleteConfirm(productId: number) {
    this.deleteTargetId = productId;
  }

  onDeleteConfirmed(confirmed: boolean) {
    const id = this.deleteTargetId;
    this.deleteTargetId = null;

    if (!confirmed || !id) return;

    this.vendorService.deleteProduct(id).subscribe({
      next: () => this.loadDashboard()
    });
  }

  statusClasses(status: string) {
    return {
      'bg-green-100 text-success': status === 'Approved',
      'bg-gray-100 text-steel': status === 'Pending',
      'bg-red-100 text-danger': status === 'Rejected'
    };
  }
}