import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const useApartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sort by combined rating (mor_rating + gabi_rating) in descending order
      const sortedData = (data || []).sort((a, b) => {
        const totalRatingA = (a.mor_rating || 0) + (a.gabi_rating || 0);
        const totalRatingB = (b.mor_rating || 0) + (b.gabi_rating || 0);
        return totalRatingB - totalRatingA;
      });
      
      setApartments(sortedData as Apartment[]);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הדירות",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
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
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להעלות את התמונה",
        variant: "destructive"
      });
      return null;
    }
  };

  const addApartment = async (apartmentData: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .insert([apartmentData])
        .select()
        .single();

      if (error) throw error;

      await fetchApartments(); // Refresh the list
      toast({
        title: "הצלחה",
        description: "הדירה נוספה בהצלחה!",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding apartment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הדירה",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateApartment = async (id: string, updates: Partial<Apartment>) => {
    try {
      const { error } = await supabase
        .from('apartments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchApartments(); // Refresh the list
      toast({
        title: "הדירה עודכנה",
        description: "הפרטים נשמרו בהצלחה",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating apartment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הדירה",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteApartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchApartments(); // Refresh the list
      toast({
        title: "הדירה נמחקה",
        description: "הדירה הוסרה מהרשימה",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את הדירה",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateRating = async (id: string, rating: number) => {
    return updateApartment(id, { rating });
  };

  const updateMorRating = async (id: string, morRating: number) => {
    return updateApartment(id, { mor_rating: morRating });
  };

  const updateGabiRating = async (id: string, gabiRating: number) => {
    return updateApartment(id, { gabi_rating: gabiRating });
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  return {
    apartments,
    loading,
    addApartment,
    updateApartment,
    deleteApartment,
    updateRating,
    updateMorRating,
    updateGabiRating,
    uploadImage,
    refreshApartments: fetchApartments
  };
};
