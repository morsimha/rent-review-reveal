export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  couple_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string;
  partner1_id: string;
  partner2_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  couple_id: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

// הרחבה לטבלאות הקיימות עם couple_id
export interface ApartmentWithCouple {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  square_meters: number | null;
  floor: number | null;
  entry_date: string | null;
  description: string | null;
  image_url: string | null;
  apartment_link: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  fb_url: string | null;
  mor_rating: number | null;
  gabi_rating: number | null;
  rating: number | null;
  status: string | null;
  spoke_with_mor: boolean | null;
  spoke_with_gabi: boolean | null;
  has_shelter: boolean | null;
  pets_allowed: string | null;
  arnona: number | null;
  note: string | null;
  scheduled_visit_text: string | null;
  created_at: string;
  updated_at: string;
  couple_id: string | null; // שדה חדש
}

export interface ScannedApartmentWithCouple {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  square_meters: number | null;
  floor: number | null;
  description: string | null;
  image_url: string | null;
  apartment_link: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  pets_allowed: string | null;
  created_at: string;
  couple_id: string | null; // שדה חדש
} 