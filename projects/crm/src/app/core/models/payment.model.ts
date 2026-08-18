export interface Payment {
  id: number;
  booking_id: number;
  amount: number | string;
  payment_type: string;
  payment_mode: string;
  txn_reference?: string;
  paid_at?: string;
  created_at?: string;
}

export interface CreatePaymentDto {
  booking_id: number;
  amount: number;
  payment_type: string;
  payment_mode: string;
  txn_reference?: string;
  paid_at?: string;
}
