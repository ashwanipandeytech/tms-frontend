export interface Quotation {
  id: number;
  quotation_no: string;
  lead_id?: number;
  customer_id?: number;
  package_id?: number;
  lead?: { name: string };
  customer?: { name: string };
  package?: { name: string };
  sub_total: number;
  discount?: number;
  gst_amount?: number;
  final_amount: number;
  status: string;
  valid_till?: string;
  created_at?: string;
}

export interface CreateQuotationDto {
  quotation_no: string;
  lead_id?: number;
  customer_id?: number;
  package_id?: number;
  sub_total: number;
  discount?: number;
  gst_amount?: number;
  final_amount: number;
  status: string;
  valid_till?: string;
}
