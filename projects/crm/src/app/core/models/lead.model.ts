export interface Lead {
  id: number;
  name: string;
  customer_name?: string;
  phone: string;
  customer_phone?: string;
  email: string;
  customer_email?: string;
  source_id?: number;
  source?: string | any;
  campaign_source?: string;
  destination: string;
  travel_date: string;
  pax_adults: number;
  pax_children: number;
  budget: number | string;
  status: string;
  assigned_to: number | any;
  assignedUser?: any;
  notes: string;
  created_at?: string;
  updated_at?: string;
}
