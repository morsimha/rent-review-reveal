
import React from 'react';
import { Button } from '@/components/ui/button';
import ApartmentFormFields from './ApartmentFormFields';
import ApartmentImageAnalysisDialog from './ApartmentImageAnalysisDialog';
import ImageUploadSection from './apartment-form/ImageUploadSection';
import ParsedResultDialog from './apartment-form/ParsedResultDialog';
import { useApartmentForm } from '@/hooks/useApartmentForm';

interface ApartmentFormProps {
  onAddApartment: (apartmentData: any) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string | null>;
}

const ApartmentForm: React.FC<ApartmentFormProps> = ({ onAddApartment, uploadImage }) => {
  const {
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
  } = useApartmentForm(onAddApartment, uploadImage);

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
      <ImageUploadSection
        formData={formData}
        setFormData={setFormData}
        uploadingImage={uploadingImage}
        onImageUpload={handleImageUpload}
        onImageUrlAnalyze={handleImageUrlAnalyze}
        onParseOnlyImage={handleParseOnlyImage}
      />

      {/* Dialog להצגת פיענוח */}
      <ParsedResultDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        parsedResult={parsedResult}
      />

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
