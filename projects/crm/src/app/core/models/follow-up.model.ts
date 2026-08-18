export interface FollowUp {
  id: number;
  lead_id: number;
  lead?: { name: string };
  type: string;
  date: string;
  time?: string;
  status: string;
  remarks?: string;
  created_at?: string;
}

export interface CreateFollowUpDto {
  lead_id: number;
  type: string;
  date: string;
  time?: string;
  status: string;
  remarks?: string;
}
