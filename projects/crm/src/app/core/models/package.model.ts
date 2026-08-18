export interface Package {
  id: number;
  name: string;
  destination_id?: number;
  category_id?: number;
  nights?: number;
  days?: number;
  price: number;
  inclusions?: string;
  exclusions?: string;
  terms?: string;
  status: string;
  created_at?: string;
}

export interface CreatePackageDto {
  name: string;
  destination_id?: number;
  category_id?: number;
  nights?: number;
  days?: number;
  price: number;
  inclusions?: string;
  exclusions?: string;
  terms?: string;
  status: string;
}
