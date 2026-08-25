import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { Product } from '../../../core/models/product';
import { OrderDto } from '../../../core/models/order';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SpinnerComponent, ImageUrlPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab: 'pending' | 'orders' = 'pending';

  pendingProducts: Product[] = [];
  orders: OrderDto[] = [];

  loadingProducts = true;
  loadingOrders = true;
  processingProductId: number | null = null;

  ngOnInit() {
    this.loadPendingProducts();
    this.loadOrders();
  }

  loadPendingProducts() {
    this.loadingProducts = true;
    this.adminService.getPendingProducts().subscribe({
      next: (products) => {
        this.pendingProducts = products;
        this.loadingProducts = false;
      },
      error: () => (this.loadingProducts = false)
    });
  }

  loadOrders() {
    this.loadingOrders = true;
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
      },
      error: () => (this.loadingOrders = false)
    });
  }

  approve(productId: number) {
    this.processingProductId = productId;
    this.adminService.approveProduct(productId).subscribe({
      next: () => {
        this.pendingProducts = this.pendingProducts.filter(p => p.id !== productId);
        this.processingProductId = null;
      },
      error: () => (this.processingProductId = null)
    });
  }

  reject(productId: number) {
    this.processingProductId = productId;
    this.adminService.rejectProduct(productId).subscribe({
      next: () => {
        this.pendingProducts = this.pendingProducts.filter(p => p.id !== productId);
        this.processingProductId = null;
      },
      error: () => (this.processingProductId = null)
    });
  }
}