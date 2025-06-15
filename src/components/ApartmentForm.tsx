import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ApartmentFormFields from './ApartmentFormFields';
import type { Apartment } from '@/types/ApartmentTypes';

interface ApartmentFormProps {
  onAddApartment: (apartmentData: any) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string | null>;
}

const INITIAL_STATE: Partial<Apartment> = {
  title: '',
  description: '',
  price: null,
  location: '',
  image_url: '',
  note: '',
  apartment_link: '',
  contact_phone: '',
  contact_name: '',
  status: 'not_spoke',
  pets_allowed: 'unknown',
  has_shelter: null,
  entry_date: '',
  arnona: null,
  square_meters: null,
  floor: null,
};

const ApartmentForm: React.FC<ApartmentFormProps> = ({ onAddApartment, uploadImage }) => {
  const [formData, setFormData] = useState<Partial<Apartment>>(INITIAL_STATE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // פיצ'ר חדש: העלאה וניתוח אוטומטי של תמונה ליצירת דירה חדשה
  const handleAnalyzeImage = async (imageUrlToAnalyze: string) => {
    setUploadingImage(true);
    try {
      const { data, error } = await (window as any).supabase.functions.invoke('analyze-apartment-image', {
        body: { imageUrl: imageUrlToAnalyze }
      });

      if (error) throw error;

      if (data?.data) {
        // מנסה להוסיף דירה חדשה אוטומטית לפי הנתונים שחולצו
        const newApartmentData = {
          ...INITIAL_STATE,
          ...data.data,
          image_url: imageUrlToAnalyze,
        };
        const success = await onAddApartment(newApartmentData);

        if (success) {
          setFormData(INITIAL_STATE);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast({
            title: "הדירה נוספה בהצלחה!",
            description: "הנתונים נלקחו אוטומטית מהתמונה 🎉",
          });
        } else {
          toast({
            title: "שגיאה בהוספה",
            description: "קרה משהו לא צפוי. אנא נסה שוב",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "לא נמצאו מספיק נתונים",
          description: "המערכת לא הצליחה לזהות נתוני דירה בתמונה",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להעלות או לנתח את התמונה",
        variant: "destructive"
      });
    }
    setUploadingImage(false);
  };

  // מפעיל את האנליזה ברגע בחירת קובץ או כתובת URL
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    setUploadingImage(false);
    if (uploadedUrl) {
      await handleAnalyzeImage(uploadedUrl);
    }
  };

  const handleImageUrlAnalyze = async () => {
    if (!formData.image_url?.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין קישור לתמונה",
        variant: "destructive"
      });
      return;
    }
    await handleAnalyzeImage(formData.image_url!);
  };

  const handleAddApartment = async () => {
    if (!formData.title?.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }

    const apartmentData = {
      fb_url: `https://facebook.com/generated-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      arnona: formData.arnona,
      square_meters: formData.square_meters,
      floor: formData.floor,
      location: formData.location,
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      rating: 0,
      mor_rating: 0,
      gabi_rating: 0,
      note: formData.note,
      apartment_link: formData.apartment_link,
      contact_phone: formData.contact_phone,
      contact_name: formData.contact_name,
      status: formData.status,
      pets_allowed: formData.pets_allowed,
      has_shelter: formData.has_shelter,
      entry_date: formData.entry_date ? formData.entry_date : null,
    };

    const success = await onAddApartment(apartmentData);

    if (success) {
      // Reset form
      setFormData(INITIAL_STATE);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* העלאת תמונה להוספה אוטומטית */}
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50 mb-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-purple-800">העלאת תמונת פוסט להוספת דירה מיידית</h3>
          <p className="text-sm text-purple-600">העלה תמונה או הכנס קישור - נחלץ את נתוני הדירה ונצרף אותה אוטומטית!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="block w-full text-sm text-purple-900 border border-purple-300 rounded-lg cursor-pointer bg-purple-50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="https://example.com/apartment-image.jpg"
              value={formData.image_url || ""}
              onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              disabled={uploadingImage}
              className="flex-1 border border-purple-300 rounded px-3 py-2 text-sm"
            />
            <Button
              type="button"
              onClick={handleImageUrlAnalyze}
              disabled={uploadingImage || !formData.image_url?.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {uploadingImage ? "מעלה..." : "שלח לאנליזה"}
            </Button>
          </div>
        </div>
        {uploadingImage && (
          <div className="text-center py-4">
            <span className="text-purple-600">מעלה/מנתח תמונה...</span>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <ApartmentFormFields
        formData={formData}
        setFormData={setFormData}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
        fileInputRef={fileInputRef}
        idPrefix="add_"
      />
      
      <Button 
        onClick={handleAddApartment}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-300"
      >
        + הוסף דירה
      </Button>
    </div>
  );
};

export default ApartmentForm;
