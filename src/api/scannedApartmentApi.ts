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

export interface ScanParameters {
  propertyType: 'rent' | 'sale';
  maxPrice: string;
  areas: string[];
  minRooms: string;
  maxRooms: string;
}

export const fetchScannedApartments = async (): Promise<ScannedApartment[]> => {
  console.log('Fetching scanned apartments...');
  const { data, error } = await supabase
    .from('scanned_apartments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching scanned apartments:', error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} scanned apartments`);
  return (data || []).map(apartment => ({
    ...apartment,
    pets_allowed: apartment.pets_allowed as 'yes' | 'no' | 'unknown'
  }));
};

export const deleteScannedApartment = async (apartmentId: string) => {
  console.log('Deleting scanned apartment:', apartmentId);
  const { error } = await supabase
    .from('scanned_apartments')
    .delete()
    .eq('id', apartmentId);

  if (error) {
    console.error('Error deleting scanned apartment:', error);
    throw error;
  }
};

export const moveScannedApartmentToMain = async (scannedApartment: ScannedApartment) => {
  console.log('Moving scanned apartment to main:', scannedApartment.id);
  
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

  if (insertError) {
    console.error('Error inserting into main apartments:', insertError);
    throw insertError;
  }

  // Remove from scanned apartments
  const { error: deleteError } = await supabase
    .from('scanned_apartments')
    .delete()
    .eq('id', scannedApartment.id);

  if (deleteError) {
    console.error('Error deleting from scanned apartments:', deleteError);
    throw deleteError;
  }

  console.log('Successfully moved apartment to main');
  return data;
};

export const scanYad2Apartments = async (scanParams: ScanParameters) => {
  console.log('Calling yad2-scanner function with params:', scanParams);
  
  try {
    const { data, error } = await supabase.functions.invoke('yad2-scanner', {
      body: { scanParams },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Function invocation failed');
    }
    
    // Handle both success with 0 results and actual results
    if (data && data.success) {
      return data;
    } else if (data && data.success === false) {
      throw new Error(data.error || 'Scan failed');
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error: any) {
    console.error('Error in scanYad2Apartments:', error);
    throw error;
  }
};

export const clearScannedApartments = async () => {
  console.log('Clearing all scanned apartments...');
  const { error } = await supabase
    .from('scanned_apartments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('Error clearing scanned apartments:', error);
    throw error;
  }
  
  console.log('Successfully cleared all scanned apartments');
};
