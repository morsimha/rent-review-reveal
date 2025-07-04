
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Apartment } from '@/types/ApartmentTypes';
import {
  fetchApartmentsFromDB,
  uploadApartmentImageToStorage,
  insertApartment,
  updateApartmentInDB,
  moveApartmentToRecycleBin
} from '@/api/apartmentApi';

export const useApartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApartments = async () => {
    try {
      const sortedData = await fetchApartmentsFromDB();
      setApartments(sortedData);
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
      return await uploadApartmentImageToStorage(file);
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
      const data = await insertApartment(apartmentData);
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
      await updateApartmentInDB(id, updates);
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
      await moveApartmentToRecycleBin(id);
      await fetchApartments(); // Refresh the list
      toast({
        title: "הדירה הועברה לסל המחזור",
        description: "הדירה הועברה לסל המחזור ונשמרה שם",
      });
      return { success: true };
    } catch (error) {
      console.error('Error moving apartment to recycle bin:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להעביר את הדירה לסל המחזור",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Updated rating functions to NOT automatically refresh apartments
  const updateRating = async (id: string, rating: number) => {
    try {
      await updateApartmentInDB(id, { rating });
      // Don't refresh here - let the parent component handle the delayed refresh
      return { success: true };
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הדירוג",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateMorRating = async (id: string, morRating: number) => {
    try {
      await updateApartmentInDB(id, { mor_rating: morRating });
      // Don't refresh here - let the parent component handle the delayed refresh
      return { success: true };
    } catch (error) {
      console.error('Error updating Mor rating:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את דירוג מור",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateGabiRating = async (id: string, gabiRating: number) => {
    try {
      await updateApartmentInDB(id, { gabi_rating: gabiRating });
      // Don't refresh here - let the parent component handle the delayed refresh
      return { success: true };
    } catch (error) {
      console.error('Error updating Gabi rating:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את דירוג גבי",
        variant: "destructive"
      });
      return { success: false, error };
    }
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
