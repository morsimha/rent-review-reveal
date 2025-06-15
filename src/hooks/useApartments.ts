import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Apartment } from '@/types/ApartmentTypes';
import {
  fetchApartmentsFromDB,
  uploadApartmentImageToStorage,
  insertApartment,
  updateApartmentInDB,
  deleteApartmentFromDB
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

  const notifyByEmail = async (apartmentData: Partial<Apartment>) => {
    try {
      const res = await fetch('https://afcdqglyehygiareaoot.supabase.co/functions/v1/send-apartment-email', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apartmentData),
      });
      const resJson = await res.json();
      console.log('send-apartment-email response:', resJson);
      if (!res.ok) {
        throw new Error(resJson?.error || 'שגיאה בשליחת מייל');
      }
      return true;
    } catch (error) {
      console.error('שגיאה בשליחת מייל על דירה חדשה:', error);
      toast({
        title: "שגיאה בשליחת מייל",
        description: error?.message || "המייל לא נשלח",
        variant: "destructive"
      });
      return false;
    }
  };

  const addApartment = async (apartmentData: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await insertApartment(apartmentData);
      await fetchApartments(); // Refresh the list

      // Email notification (now we await, check result and show toast if failed)
      const emailSent = await notifyByEmail(apartmentData);
      if (emailSent) {
        toast({
          title: "התראה במייל נשלחה",
          description: "נשלח מייל למור וגבי על דירה חדשה.",
        });
      }

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
      await deleteApartmentFromDB(id);
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
