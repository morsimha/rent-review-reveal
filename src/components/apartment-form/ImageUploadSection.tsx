
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/types/ApartmentTypes';

interface ImageUploadSectionProps {
  formData: Partial<Apartment>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Apartment>>>;
  uploadingImage: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlAnalyze: () => void;
  onParseOnlyImage: () => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  formData,
  setFormData,
  uploadingImage,
  onImageUpload,
  onImageUrlAnalyze,
  onParseOnlyImage,
}) => {
  const { toast } = useToast();

  const handleParseClick = () => {
    if (!formData.image_url?.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין קישור לתמונה",
        variant: "destructive"
      });
      return;
    }
    onParseOnlyImage();
  };

  const handleAnalyzeClick = () => {
    if (!formData.image_url?.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין קישור לתמונה",
        variant: "destructive"
      });
      return;
    }
    onImageUrlAnalyze();
  };

  return (
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
            onChange={onImageUpload}
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
            onClick={handleAnalyzeClick}
            disabled={uploadingImage || !formData.image_url?.trim()}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {uploadingImage ? "מעלה..." : "שלח לאנליזה"}
          </Button>
          <Button
            type="button"
            onClick={handleParseClick}
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
  );
};

export default ImageUploadSection;
