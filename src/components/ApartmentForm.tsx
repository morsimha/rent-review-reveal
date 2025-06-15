
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ApartmentFormFields from './ApartmentFormFields';
import type { Apartment } from '@/types/ApartmentTypes';
import { supabase } from '@/integrations/supabase/client';
import ApartmentImageAnalysisDialog from './ApartmentImageAnalysisDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

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

  // Dialog תצוגה עבור פיענוח בלבד
  const [showDialog, setShowDialog] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  // ---------- דיאלוג עריכה מהירה לדירה שנחלקה מתמונה ----------
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditData, setQuickEditData] = useState<Partial<Apartment> | null>(null);

  // פונקציה לנקות ולהמיר נתוני תאריך
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

  // ניתוח תמונה: פותח דיאלוג עריכה לפני שמירה
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

  // פירסר בלבד (תצוגה בלבד של תוצאה)
  const handleParseOnlyImage = async () => {
    if (!formData.image_url?.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין קישור לתמונה",
        variant: "destructive"
      });
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

  // שמירה מתוך דיאלוג עריכה מהירה
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

  // העלאה וניתוח: פותח עריכה מהירה
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
      entry_date: cleanDateData(formData.entry_date),
    };
    const success = await onAddApartment(apartmentData);
    if (success) {
      setFormData(INITIAL_STATE);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* דיאלוג עריכת נתוני תמונה */}
      <ApartmentImageAnalysisDialog
        open={showQuickEdit}
        setOpen={setShowQuickEdit}
        quickEditData={quickEditData}
        setQuickEditData={setQuickEditData}
        uploadingImage={uploadingImage}
        handleImageUpload={handleImageUpload}
        onSave={handleQuickEditSave}
      />

      {/* העלאת תמונה + אנליזה */}
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
            <Button
              type="button"
              onClick={handleParseOnlyImage}
              disabled={uploadingImage || !formData.image_url?.trim()}
              variant="secondary"
              className="bg-purple-100 text-purple-700 border-purple-400 hover:bg-purple-200 transition"
            >
              פרסר
            </Button>
          </div>
        </div>
        {uploadingImage && (
          <div className="text-center py-4">
            <span className="text-purple-600">מעלה/מנתח תמונה...</span>
          </div>
        )}
      </div>

      {/* Dialog להצגת פיענוח */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פיענוח אוטומטי מהתמונה</DialogTitle>
            <DialogDescription>
              אלו הנתונים שחולצו ע"י OpenAI:
            </DialogDescription>
          </DialogHeader>
          <div dir="ltr" className="overflow-x-auto p-2 bg-gray-100 rounded border text-sm max-h-80">
            <pre className="whitespace-pre-wrap break-words">{parsedResult ? JSON.stringify(parsedResult, null, 2) : "אין נתונים"}</pre>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">סגור</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
