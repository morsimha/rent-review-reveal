import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/types/ApartmentTypes';
import { supabase } from '@/integrations/supabase/client';

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

export const useApartmentForm = (
  onAddApartment: (apartmentData: any) => Promise<boolean>,
  uploadImage: (file: File) => Promise<string | null>
) => {
  const [formData, setFormData] = useState<Partial<Apartment>>(INITIAL_STATE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditData, setQuickEditData] = useState<Partial<Apartment> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const cleanDateData = (dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    const hebrewWords = /מידית|כעת|עכשיו|תכף|בקרוב/;
    if (hebrewWords.test(dateString)) {
      return null;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  };

  const handleAnalyzeImage = async (imageUrlToAnalyze: string) => {
    setUploadingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-apartment-image', {
        body: { imageUrl: imageUrlToAnalyze }
      });
      if (error) {
        throw new Error(`שגיאת ניתוח: ${error.message || 'בעיה בשרת'}`);
      }
      if (data?.data) {
        const cleanedData = {
          ...data.data,
          entry_date: cleanDateData(data.data.entry_date),
          price: data.data.price ? Number(data.data.price) : null,
          arnona: data.data.arnona ? Number(data.data.arnona) : null,
          square_meters: data.data.square_meters ? Number(data.data.square_meters) : null,
          floor: data.data.floor ? Number(data.data.floor) : null,
        };
        setQuickEditData({
          ...INITIAL_STATE,
          ...cleanedData,
          image_url: imageUrlToAnalyze,
        });
        setShowQuickEdit(true);
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
        description: `לא הצלחנו להעלות או לנתח את התמונה: ${error.message}`,
        variant: "destructive"
      });
    }
    setUploadingImage(false);
  };

  const handleParseOnlyImage = async () => {
    if (!formData.image_url?.trim()) {
      return;
    }
    setUploadingImage(true);
    setParsedResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-apartment-image', {
        body: { imageUrl: formData.image_url }
      });
      if (error) {
        toast({
          title: "שגיאה בניתוח",
          description: error.message || "בעיה בניתוח התמונה",
          variant: "destructive"
        });
      } else if (data?.data) {
        setParsedResult(data.data);
        setShowDialog(true);
      } else {
        toast({
          title: "לא נמצא תוכן",
          description: "המערכת לא הצליחה לנתח מידע מהתמונה",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "שגיאה",
        description: err?.message || "קרתה שגיאה לא צפויה",
        variant: "destructive"
      });
    }
    setUploadingImage(false);
  };

  const handleQuickEditSave = async () => {
    if (!quickEditData?.title?.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת לפני שמירה",
        variant: "destructive"
      });
      return;
    }
    const apartmentData = {
      fb_url: `https://facebook.com/generated-${Date.now()}`,
      ...quickEditData,
      entry_date: cleanDateData(quickEditData.entry_date || ""),
      rating: 0,
      mor_rating: 0,
      gabi_rating: 0,
      scheduled_visit_text: quickEditData.scheduled_visit_text || null,
    };
    const success = await onAddApartment(apartmentData);
    if (success) {
      setFormData(INITIAL_STATE);
      setQuickEditData(null);
      setShowQuickEdit(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({
        title: "הדירה נוספה בהצלחה!",
        description: "ערכת ושלחת דירה שנוספה אוטומטית מהתמונה 🎉",
      });
    } else {
      toast({
        title: "שגיאה בהוספה",
        description: "קרה משהו לא צפוי. נסה שוב",
        variant: "destructive"
      });
    }
  };

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
    if (formData.image_url?.trim()) {
      await handleAnalyzeImage(formData.image_url);
    }
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
      entry_date: cleanDateData(formData.entry_date),
      scheduled_visit_text: formData.scheduled_visit_text || null,
    };
    const success = await onAddApartment(apartmentData);
    if (success) {
      setFormData(INITIAL_STATE);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    formData,
    setFormData,
    uploadingImage,
    showDialog,
    setShowDialog,
    parsedResult,
    showQuickEdit,
    setShowQuickEdit,
    quickEditData,
    setQuickEditData,
    fileInputRef,
    handleImageUpload,
    handleImageUrlAnalyze,
    handleParseOnlyImage,
    handleQuickEditSave,
    handleAddApartment,
  };
};
