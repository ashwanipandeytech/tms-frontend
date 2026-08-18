export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source_id: number;
  source?: any; // Adjust based on actual API
  destination: string;
  travel_date: string;
  pax_adults: number;
  pax_children: number;
  budget: number | string;
  status: string;
  assigned_to: number | null;
  assignedUser?: any; // Adjust based on actual API
  notes: string;
  created_at?: string;
  updated_at?: string;
}
