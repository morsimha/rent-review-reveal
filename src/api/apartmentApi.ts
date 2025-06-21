import { supabase } from '@/integrations/supabase/client';
import { Apartment } from '@/types/ApartmentTypes';

export const fetchApartmentsFromDB = async (): Promise<Apartment[]> => {
  // Get current user's couple_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Get user's profile to find couple_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  const coupleId = profile?.couple_id;

  // Fetch apartments for the user's couple
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('couple_id', coupleId)
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
  // Get current user's couple_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get user's profile to find couple_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  const coupleId = profile?.couple_id;
  if (!coupleId) {
    throw new Error('User not associated with a couple');
  }

  // Add couple_id to apartment data
  const apartmentWithCouple = {
    ...apartmentData,
    couple_id: coupleId
  };

  const { data, error } = await supabase
    .from('apartments')
    .insert([apartmentWithCouple])
    .select()
    .single();
  if (error) throw error;
  
  // Send email notification for new apartment (כולל שדה הערות)
  try {
    await supabase.functions.invoke('send-apartment-email', {
      body: {
        ...apartmentData,
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

// *** MAIN CHANGE: Remove the email notification logic from updateApartmentInDB ***
export const updateApartmentInDB = async (id: string, updates: Partial<Apartment>) => {
  const { error: updateError } = await supabase
    .from('apartments')
    .update(updates)
    .eq('id', id);
  if (updateError) throw updateError;
};

export const deleteApartmentFromDB = async (id: string) => {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
