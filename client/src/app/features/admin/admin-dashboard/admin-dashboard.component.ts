import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../admin.service';
import { AdminDashboardDto, SalesOverTimeItem } from '../../../core/models/admin-dashboard.model';
import { Product } from '../../../core/models/product';
import { OrderDto } from '../../../core/models/order';
import { ProductParams } from '../../../core/models/product-params';
import { OrderSpecParams } from '../../../core/models/order-spec-params';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, FormsModule, SpinnerComponent, ImageUrlPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  @ViewChild('salesChart') salesChartRef?: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  activeTab: 'products' | 'orders' = 'products';

  // sales data
  dashboard: AdminDashboardDto | null = null;
  loadingDashboard = true;
  salesData: SalesOverTimeItem[] = [];

  // products
  products: Product[] = [];
  productParams = new ProductParams();
  productsCount = 0;
  loadingProducts = true;
  processingProductId: number | null = null;

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  // orders
  orders: OrderDto[] = [];
  orderParams = new OrderSpecParams();
  ordersCount = 0;
  loadingOrders = true;

  ngOnInit() {
    this.loadDashboard();
    this.loadProducts();
    this.loadOrders();
  }

  ngAfterViewInit() {
    // wait for the view to be initialized
    setTimeout(() => this.renderChart());
  }

  loadDashboard() {
    this.loadingDashboard = true;
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loadingDashboard = false;
      },
      error: () => (this.loadingDashboard = false)
    });

    this.adminService.getSalesOverTime().subscribe(data => {
      this.salesData = data;
      setTimeout(() => this.renderChart());
    });
  }

  renderChart() {
    if (!this.salesChartRef || this.salesData.length === 0) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.salesData.map(d => d.name),
        datasets: [{
          label: 'Revenue',
          data: this.salesData.map(d => d.value),
          borderColor: '#FF4715',
          backgroundColor: 'rgba(255, 71, 21, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // products

  loadProducts() {
    this.loadingProducts = true;
    this.adminService.getAllProducts(this.productParams).subscribe({
      next: (res) => {
        this.products = res.data;
        this.productsCount = res.count;
        this.loadingProducts = false;
      },
      error: () => (this.loadingProducts = false)
    });
  }

  onStatusFilterChange() {
    this.productParams.pageIndex = 1;
    this.loadProducts();
  }

  approve(id: number) {
    this.processingProductId = id;
    this.adminService.approveProduct(id).subscribe({
      next: () => { this.loadProducts(); this.processingProductId = null; },
      error: () => (this.processingProductId = null)
    });
  }

  reject(id: number) {
    this.processingProductId = id;
    this.adminService.rejectProduct(id).subscribe({
      next: () => { this.loadProducts(); this.processingProductId = null; },
      error: () => (this.processingProductId = null)
    });
  }

  suspend(id: number) {
    this.processingProductId = id;
    this.adminService.suspendProduct(id).subscribe({
      next: () => { this.loadProducts(); this.processingProductId = null; },
      error: () => (this.processingProductId = null)
    });
  }

  get productTotalPages(): number {
    return Math.ceil(this.productsCount / this.productParams.pageSize);
  }

  goToProductPage(page: number) {
    this.productParams.pageIndex = page;
    this.loadProducts();
  }

  statusClasses(status: string) {
    return {
      'bg-green-100 text-success': status === 'Approved',
      'bg-gray-100 text-steel': status === 'Pending',
      'bg-red-100 text-danger': status === 'Rejected' || status === 'Suspended'
    };
  }

  // orders

  loadOrders() {
    this.loadingOrders = true;
    this.adminService.getOrders(this.orderParams).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.ordersCount = res.count;
        this.loadingOrders = false;
      },
      error: () => (this.loadingOrders = false)
    });
  }

  get orderTotalPages(): number {
    return Math.ceil(this.ordersCount / this.orderParams.pageSize);
  }

  goToOrderPage(page: number) {
    this.orderParams.pageIndex = page;
    this.loadOrders();
  }

  openOrder(id: number) {
    this.router.navigateByUrl(`/admin/orders/${id}`);
  }
}