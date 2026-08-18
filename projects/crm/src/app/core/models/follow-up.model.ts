export interface FollowUp {
  id: number;
  lead_id: number;
  lead?: { name: string };
  type: string;
  follow_up_date: string;
  follow_up_time?: string;
  status: string;
  remarks?: string;
  created_at?: string;
}

export interface CreateFollowUpDto {
  lead_id: number;
  type: string;
  follow_up_date: string;
  follow_up_time?: string;
  status: string;
  remarks?: string;
}
