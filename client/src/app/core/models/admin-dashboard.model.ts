export interface AdminDashboardDto {
  totalOrders: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  suspendedProducts: number;
  vendorCount: number;
  totalRevenue: number;
  adminPublishedProducts: number;
}

export interface SalesOverTimeItem {
  name: string;
  value: number;
}

export interface VendorSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userName: string;
}