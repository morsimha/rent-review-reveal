
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import ApartmentFormFields from './ApartmentFormFields';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Apartment } from '@/types/ApartmentTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  quickEditData: Partial<Apartment> | null;
  setQuickEditData: React.Dispatch<React.SetStateAction<Partial<Apartment> | null>>;
  uploadingImage: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const ApartmentImageAnalysisDialog: React.FC<Props> = ({
  open,
  setOpen,
  quickEditData,
  setQuickEditData,
  uploadingImage,
  handleImageUpload,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-2xl'} overflow-y-auto`} 
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>עבור על הנתונים לפני שמירה</DialogTitle>
          <DialogDescription>
            נתוני הדירה חולצו אוטומטית. אנא בדוק וערוך אותם לפי הצורך לפני שמירה!
          </DialogDescription>
        </DialogHeader>
        <div className={`${isMobile ? 'max-h-[60vh]' : ''} overflow-y-auto`}>
          {quickEditData && (
            <ApartmentFormFields
              formData={quickEditData}
              setFormData={setQuickEditData as any}
              handleImageUpload={handleImageUpload}
              uploadingImage={uploadingImage}
              fileInputRef={fileInputRef}
              idPrefix="quick_edit_"
            />
          )}
        </div>
        <DialogFooter className="flex-col gap-2">
          <Button onClick={onSave} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-2">
            שמור דירה
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" className="w-full">ביטול</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentImageAnalysisDialog;
