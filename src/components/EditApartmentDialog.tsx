
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/types/ApartmentTypes';
import ApartmentFormFields from './ApartmentFormFields';

interface EditApartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: Apartment | null;
  onSave: (apartmentId: string, updates: Partial<Apartment>) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
}

const EditApartmentDialog: React.FC<EditApartmentDialogProps> = ({
  isOpen,
  onClose,
  apartment,
  onSave,
  uploadImage
}) => {
  const [editFormData, setEditFormData] = useState<Partial<Apartment>>({});
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (apartment) {
      setEditFormData({ ...apartment });
    }
  }, [apartment]);

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setEditFormData(prev => ({...prev, image_url: uploadedUrl}));
    }
    setEditUploadingImage(false);
  };

  const handleSaveEdit = async () => {
    if (!apartment || !editFormData.title?.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }

    await onSave(apartment.id, editFormData);
    onClose();
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">ערוך דירה</DialogTitle>
        </DialogHeader>
        <ApartmentFormFields
          formData={editFormData}
          setFormData={setEditFormData}
          handleImageUpload={handleEditImageUpload}
          uploadingImage={editUploadingImage}
          fileInputRef={editFileInputRef}
          idPrefix="edit_"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">
            שמור
          </Button>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditApartmentDialog;
