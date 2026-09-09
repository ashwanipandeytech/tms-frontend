export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type DiscountType = 'fixed' | 'percentage';
export type QuotationItemType = 'package' | 'hotel' | 'resort' | 'villa' | 'cab' | 'custom';

export interface QuotationItem {
  id?: number;
  quotation_id?: number;
  item_type: QuotationItemType;
  description: string;
  nights?: number;
  check_in?: string;
  check_out?: string;
  unit_price: number;
  quantity?: number;
  qty?: number;
  amount?: number;
  total_price?: number;
  sort_order?: number;
  meta?: any;
}

export interface ItineraryDay {
  id?: number;
  itinerary_id?: number;
  day_number: number;
  title: string;
  description?: string;
  hotel_id?: number;
  hotel?: any;
  resort_id?: number;
  resort?: any;
  villa_id?: number;
  villa?: any;
  meals?: string;
  activities?: any[];
  transport?: any;
  notes?: string;
  images?: string[];
}

export interface Itinerary {
  id?: number;
  company_id?: number;
  quotation_id?: number;
  package_id?: number;
  title?: string;
  description?: string;
  total_days?: number;
  total_nights?: number;
  status?: string;
  days?: ItineraryDay[];
}

export interface Quotation {
  id: number;
  company_id?: number;
  quotation_no: string;
  lead_id?: number;
  lead?: any;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  travel_date?: string;
  return_date?: string;
  adults?: number;
  children?: number;
  infants?: number;
  destination?: string;
  package_id?: number;
  package?: any;
  coupon_id?: number;
  sub_total: number;
  discount_type?: DiscountType;
  discount: number;
  gst_amount: number;
  tax_percentage?: number;
  final_amount: number;
  status: QuotationStatus;
  valid_till?: string;
  pdf_path?: string;
  notes?: string;
  terms_and_conditions?: string;
  sent_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  converted_booking_id?: number;
  version?: number;
  created_by?: number;
  creator?: any;
  items?: QuotationItem[];
  itinerary?: Itinerary;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationPayload {
  lead_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  travel_date?: string;
  return_date?: string;
  adults?: number;
  children?: number;
  infants?: number;
  destination?: string;
  package_id?: number;
  coupon_id?: number;
  sub_total?: number;
  discount_type?: DiscountType;
  discount?: number;
  tax_percentage?: number;
  gst_amount?: number;
  final_amount?: number;
  status?: QuotationStatus;
  valid_till?: string;
  notes?: string;
  terms_and_conditions?: string;
  items?: Partial<QuotationItem>[];
  itinerary?: Partial<Itinerary>;
}
