export interface ProductVendor {
  firstName: string | null;
  lastName: string | null;
  userName: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  vendorId: string | null;
  vendor: ProductVendor | null;
  createdAt: string;
}