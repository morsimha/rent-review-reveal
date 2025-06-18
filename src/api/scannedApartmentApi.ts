import { supabase } from '@/integrations/supabase/client';

export interface ScannedApartment {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  apartment_link: string;
  contact_phone: string;
  contact_name: string;
  pets_allowed: 'yes' | 'no' | 'unknown';
  square_meters: number;
  floor: number;
  created_at: string;
}

export const getScannedApartments = async (): Promise<ScannedApartment[]> => {
  try {
    const { data, error } = await supabase
      .from('scanned_apartments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // המר את pets_allowed לטייפ הנכון
    return (data || []).map(apartment => ({
      ...apartment,
      pets_allowed: (apartment.pets_allowed as 'yes' | 'no' | 'unknown') || 'unknown'
    }));
  } catch (error) {
    console.error('Error fetching scanned apartments:', error);
    return [];
  }
};

export const scanYad2Apartments = async (searchQuery: string): Promise<{ count: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke('scan-yad2', {
      body: { searchQuery }
    });

    if (error) throw error;
    
    return { count: data.count || 0 };
  } catch (error) {
    console.error('Error scanning Yad2:', error);
    throw error;
  }
};

export const clearScannedApartments = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scanned_apartments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround)

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing scanned apartments:', error);
    throw error;
  }
};