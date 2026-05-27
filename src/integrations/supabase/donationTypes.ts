export type DonationStatus = 'available' | 'claimed' | 'expired';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Donation {
  id: string;                   // uuid PRIMARY
  hotel_id: string;             // uuid FOREIGN KEY
  food_type: string;            // text NON-NULLABLE
  food_name: string;            // text NON-NULLABLE
  quantity_servings: number;    // int4 NON-NULLABLE
  pickup_time: string;          // timestamptz NON-NULLABLE
  notes: string | null;         // text NULLABLE
  status: string | null;        // text NULLABLE
  created_at: string | null;    // timestamptz NULLABLE
  expires_at: string;           // timestamptz
  latitude: number | null;      // float8 NULLABLE
  longitude: number | null;     // float8 NULLABLE
}

export interface DonationInsert {
  hotel_id: string;
  food_type: string;
  food_name: string;
  quantity_servings: number;
  pickup_time: string;
  notes?: string;
  status?: string;
  expires_at?: string;
  latitude?: number;
  longitude?: number;
}

export interface DonationClaim {
  id: string;
  donation_id: string;
  ngo_name: string;
  contact_person: string;
  phone: string;
  email: string;
  message: string | null;
  status: ClaimStatus;
  created_at: string;
}

export interface ClaimInsert {
  donation_id: string;
  ngo_name: string;
  contact_person: string;
  phone: string;
  email: string;
  message?: string;
}