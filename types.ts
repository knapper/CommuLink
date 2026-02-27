export enum BloodType {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
  UNKNOWN = "Unknown"
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
  bloodType: BloodType;
  allowContact: boolean;
  avatarUrl?: string;
  communityId: string;
  isDonor: boolean; // Organ Donor
  isBloodDonor: boolean; // Blood Donor
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  category: 'Request' | 'Offer' | 'General';
  createdAt: string; // ISO Date string
  expiresAt: string; // ISO Date string
  communityId: string;
}

export interface Community {
  id: string;
  name: string;
  type: 'Church' | 'Club' | 'Neighborhood' | 'School' | 'Other';
  logoUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  community: Community | null;
}