export interface Package {
  id: number;
  name: string;
  quotation_id?: number;
  quotation?: { quotation_no: string };
  created_at?: string;
}

export interface CreatePackageDto {
  name: string;
  quotation_id?: number;
}
