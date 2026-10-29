export interface ServiceDto {
  id: number;
  title: string;
  price: number;
  durationMinutes: number;
  businessId: number;
}

export interface ServiceInput {
  title: string;
  price: number;
  durationMinutes: number;
}
