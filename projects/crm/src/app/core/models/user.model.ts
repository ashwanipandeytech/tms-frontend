export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface User {
  id: number;
  company_id: number | null;
  company_name?: string;
  company?: any;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  status: string;
  role: Role;
}

export interface LoginResponse {
  user: User;
  token: string;
}
