
export interface Apartment {
  id: string;
  fb_url: string | null;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  image_url: string | null;
  rating: number;
  mor_rating: number;
  gabi_rating: number;
  note: string | null;
  apartment_link: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  status: 'spoke' | 'not_spoke' | 'no_answer';
  pets_allowed: 'yes' | 'no' | 'unknown';
  created_at: string;
  updated_at: string;
  has_shelter: boolean | null;
  entry_date: string | null;
  arnona: number | null;
  square_meters: number | null;
  floor: number | null;
  spoke_with_mor?: boolean | null;
  spoke_with_gabi?: boolean | null;
  scheduled_visit_text?: string | null;
  couple_id?: string | null;
}

export interface UserProfile {
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
