
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Apartment } from '@/types/ApartmentTypes';

interface EmailNotificationData {
  title: string;
  description?: string;
  price?: number;
  location?: string;
  image_url?: string;
  arnona?: number;
  square_meters?: number;
  floor?: number;
  contact_name?: string;
  contact_phone?: string;
  status?: string;
  entry_date?: string;
  action: 'added' | 'updated';
}

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendApartmentNotification = async (apartmentData: Partial<Apartment>, action: 'added' | 'updated') => {
    try {
      console.log('Sending apartment notification:', { apartmentData, action });
      
      const emailData: EmailNotificationData = {
        title: apartmentData.title || '',
        description: apartmentData.description || '',
        price: apartmentData.price || undefined,
        location: apartmentData.location || '',
        image_url: apartmentData.image_url || '',
        arnona: apartmentData.arnona || undefined,
        square_meters: apartmentData.square_meters || undefined,
        floor: apartmentData.floor || undefined,
        contact_name: apartmentData.contact_name || '',
        contact_phone: apartmentData.contact_phone || '',
        status: apartmentData.status || '',
        entry_date: apartmentData.entry_date || '',
        action
      };

      const { data, error } = await supabase.functions.invoke('send-apartment-email', {
        body: emailData
      });

      console.log('Email notification response:', { data, error });

      if (error) {
        throw new Error(error.message || 'שגיאה בשליחת מייל');
      }

      const actionText = action === 'added' ? 'נוספה' : 'עודכנה';
      toast({
        title: "מייל נשלח בהצלחה",
        description: `נשלח מייל למור וגבי - דירה ${actionText}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error sending email notification:', error);
      toast({
        title: "שגיאה בשליחת מייל",
        description: error?.message || "המייל לא נשלח",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    sendApartmentNotification
  };
};
