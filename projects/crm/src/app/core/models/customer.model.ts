export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status?: string;
  created_at?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  status?: string;
}
