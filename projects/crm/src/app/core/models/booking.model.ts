export interface Booking {
  id: number;
  lead_id: number;
  customer_id: number;
  package_id: number;
  travel_date: string;
  total_amount: number | string;
  paid_amount: number | string;
  due_amount?: number | string;
  booking_no?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Included relations based on needs
  customer?: any;
  lead?: any;
  package?: any;
}
