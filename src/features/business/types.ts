export interface BusinessDto {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string | null;
  ownerId: string;
}

export interface BusinessInput {
  name: string;
  city: string;
  address: string;
  description: string | null;
}
