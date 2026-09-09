export interface FollowUp {
  id: number;
  company_id?: number;
  lead_id: number;
  assigned_to?: number;
  created_by?: number;
  follow_up_date: string;
  follow_up_time?: string;
  scheduled_at?: string;
  completed_at?: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'done' | 'rescheduled' | 'overdue' | 'missed' | 'cancelled';
  remarks?: string;
  remind_whatsapp?: boolean;
  remind_email?: boolean;
  created_at?: string;
  lead?: {
    id: number;
    lead_id?: string;
    customer_name?: string;
    name?: string;
    customer_phone?: string;
    phone?: string;
    customer_email?: string;
    destination?: string;
    status?: string;
    assigned_to?: number;
  };
  assigned_user?: {
    id: number;
    name: string;
    email: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

export interface CreateFollowUpDto {
  lead_id: number;
  assigned_to?: number;
  follow_up_date: string;
  follow_up_time?: string;
  type?: string;
  priority?: string;
  remarks?: string;
  remind_whatsapp?: boolean;
  remind_email?: boolean;
}

export interface CompleteFollowUpDto {
  outcome?: string;
  remarks?: string;
}

export interface RescheduleFollowUpDto {
  follow_up_date: string;
  follow_up_time?: string;
  type?: string;
  priority?: string;
  reason?: string;
  remarks?: string;
  assigned_to?: number;
}

export interface LeadActivity {
  id: number;
  company_id?: number;
  lead_id: number;
  user_id: number;
  activity_type: string;
  is_internal: boolean;
  description: string;
  comment?: string;
  metadata?: any;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    role?: string;
  };
}
