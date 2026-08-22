export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  firstName: string | null;
  lastName: string | null;
  email: string;
  userName: string;
  address: Address | null;
  roles: string;
}