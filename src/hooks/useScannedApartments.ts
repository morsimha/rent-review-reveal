
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScannedApartment, fetchScannedApartments, moveScannedApartmentToMain } from '@/api/scannedApartmentApi';

export const useScannedApartments = () => {
  const [scannedApartments, setScannedApartments] = useState<ScannedApartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchScanned = async () => {
    try {
      const data = await fetchScannedApartments();
      setScannedApartments(data);
    } catch (error) {
      console.error('Error fetching scanned apartments:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הדירות הסרוקות",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const likeScannedApartment = async (apartment: ScannedApartment) => {
    try {
      await moveScannedApartmentToMain(apartment);
      await fetchScanned(); // Refresh the list
      
      toast({
        title: "הדירה נוספה!",
        description: "הדירה הועברה לרשימת הדירות הרגילה",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error moving apartment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הדירה",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchScanned();
  }, []);

  return {
    scannedApartments,
    loading,
    likeScannedApartment,
    refreshScanned: fetchScanned
  };
};
