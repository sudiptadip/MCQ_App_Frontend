export interface UpsertFranchiseDto {
  id?: number;
  name: string;
  contact_email: string;
  owner_name: string;
  password?: string;
  confirmPassword?: string
}