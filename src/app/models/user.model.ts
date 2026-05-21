export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  yapeNumber: string;
  bcpAccount?: string; // Opcional
}