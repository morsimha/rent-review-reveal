
import { supabase } from '@/integrations/supabase/client';

export interface ScannedApartment {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  image_url: string | null;
  apartment_link: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  square_meters: number | null;
  floor: number | null;
  pets_allowed: 'yes' | 'no' | 'unknown';
  created_at: string;
}

export const fetchScannedApartments = async (): Promise<ScannedApartment[]> => {
  const { data, error } = await supabase
    .from('scanned_apartments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const moveScannedApartmentToMain = async (scannedApartment: ScannedApartment) => {
  // Insert into main apartments table
  const { data, error: insertError } = await supabase
    .from('apartments')
    .insert([{
      title: scannedApartment.title,
      description: scannedApartment.description,
      price: scannedApartment.price,
      location: scannedApartment.location,
      image_url: scannedApartment.image_url,
      apartment_link: scannedApartment.apartment_link,
      contact_phone: scannedApartment.contact_phone,
      contact_name: scannedApartment.contact_name,
      square_meters: scannedApartment.square_meters,
      floor: scannedApartment.floor,
      pets_allowed: scannedApartment.pets_allowed,
      status: 'not_spoke',
      rating: 0,
      mor_rating: 0,
      gabi_rating: 0,
    }])
    .select()
    .single();

  if (insertError) throw insertError;

  // Remove from scanned apartments
  const { error: deleteError } = await supabase
    .from('scanned_apartments')
    .delete()
    .eq('id', scannedApartment.id);

  if (deleteError) throw deleteError;

  return data;
};

export const scanYad2Apartments = async (searchQuery: string) => {
  const { data, error } = await supabase.functions.invoke('yad2-scanner', {
    body: { searchQuery }
  });

  if (error) throw error;
  return data;
};

export const clearScannedApartments = async () => {
  const { error } = await supabase
    .from('scanned_apartments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) throw error;
};
