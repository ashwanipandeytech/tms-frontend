export interface DashboardKPIs {
  total_leads: number;
  new_enquiries: number;
  followups_today: number;
  confirmed: number;
  revenue: number;
  pending_pay: number;
}

export interface DashboardFunnel {
  new: number;
  contacted: number;
  interested: number;
  confirmed: number;
}

export interface UpcomingDeparture {
  id: number;
  booking_no: string;
  travel_date: string;
  package: {
    id: number;
    name: string;
  };
}

export interface DashboardData {
  kpis: DashboardKPIs;
  funnel: DashboardFunnel;
  upcoming_departures: UpcomingDeparture[];
}
