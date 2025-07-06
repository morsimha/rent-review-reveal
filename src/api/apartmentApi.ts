
import { supabase } from '@/integrations/supabase/client';
import { Apartment } from '@/types/ApartmentTypes';

export const fetchApartmentsFromDB = async (): Promise<Apartment[]> => {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Sort by combined rating (mor_rating + gabi_rating) in descending order
  return (data || []).sort((a, b) => {
    const totalA = (a.mor_rating || 0) + (a.gabi_rating || 0);
    const totalB = (b.mor_rating || 0) + (b.gabi_rating || 0);
    return totalB - totalA;
  }) as Apartment[];
};

export const uploadApartmentImageToStorage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `apartment-images/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('apartment-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;
  const { data } = supabase.storage
    .from('apartment-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const insertApartment = async (apartmentData: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get the user's couple_id from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw new Error('Failed to get user profile');
  }

  const dataWithCoupleId = {
    ...apartmentData,
    couple_id: profile?.couple_id || null,
  };

  const { data, error } = await supabase
    .from('apartments')
    .insert([dataWithCoupleId])
    .select()
    .single();
  if (error) throw error;
  
  // Send email notification for new apartment (כולל שדה הערות)
  try {
    await supabase.functions.invoke('send-apartment-email', {
      body: {
        ...dataWithCoupleId,
        action: 'added',
        note: apartmentData.note || "", // ensure נשלח
      }
    });
    console.log('Email notification sent for new apartment');
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
    // Don't fail the apartment creation if email fails
  }
  
  return data;
};

export const updateApartmentInDB = async (id: string, updates: Partial<Apartment>) => {
  const { error: updateError } = await supabase
    .from('apartments')
    .update(updates)
    .eq('id', id);
  if (updateError) throw updateError;
};

export const moveApartmentToRecycleBin = async (id: string) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get the user's couple_id from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw new Error('Failed to get user profile');
  }

  // First, get the apartment data
  const { data: apartment, error: fetchError } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Insert into scanned_apartments (recycle bin)
  const { error: insertError } = await supabase
    .from('scanned_apartments')
    .insert([{
      title: apartment.title,
      description: apartment.description,
      price: apartment.price,
      location: apartment.location,
      image_url: apartment.image_url,
      apartment_link: apartment.apartment_link,
      contact_phone: apartment.contact_phone,
      contact_name: apartment.contact_name,
      square_meters: apartment.square_meters,
      floor: apartment.floor,
      pets_allowed: apartment.pets_allowed,
      couple_id: profile?.couple_id || null,
    }]);
  
  if (insertError) throw insertError;
  
  // Delete from apartments
  const { error: deleteError } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id);
  
  if (deleteError) throw deleteError;
};
