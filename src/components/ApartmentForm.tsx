
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setFormData(prev => ({...prev, image_url: uploadedUrl}));
    }
    setUploadingImage(false);
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
    <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardContent className="p-6">
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
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-300"
        >
          + הוסף דירה
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApartmentForm;
