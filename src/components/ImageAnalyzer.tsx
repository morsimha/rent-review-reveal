
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Apartment } from '@/types/ApartmentTypes';

interface ImageAnalyzerProps {
  onDataExtracted: (data: Partial<Apartment>) => void;
  uploadImage: (file: File) => Promise<string | null>;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onDataExtracted, uploadImage }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();

  const analyzeImage = async (imageUrlToAnalyze: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-apartment-image', {
        body: { imageUrl: imageUrlToAnalyze }
      });

      if (error) throw error;

      if (data.data) {
        onDataExtracted(data.data);
        toast({
          title: "הצלחה!",
          description: "הנתונים נוספו אוטומטיות מהתמונה",
        });
      } else {
        toast({
          title: "לא נמצאו נתונים",
          description: "לא ניתן לזהות נתוני דירה בתמונה",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      // הצגת הודעה ידידותית למקרה מגבלת קצב
      const openAiRateLimit = error?.details?.includes?.('429') || error?.message?.includes?.('429');
      if (openAiRateLimit) {
        toast({
          title: "מכסה OpenAI נוצלה",
          description: "המכסה שלך ב-OpenAI נוצלה או שיש מגבלת קצב. נסה שוב מאוחר יותר.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "שגיאה",
          description: "לא ניתן לנתח את התמונה",
          variant: "destructive"
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
      await analyzeImage(uploadedUrl);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס קישור לתמונה",
        variant: "destructive"
      });
      return;
    }
    await analyzeImage(imageUrl);
  };

  return (
    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50">
      <div className="text-center mb-4">
        <Camera className="mx-auto h-12 w-12 text-purple-500 mb-2" />
        <h3 className="text-lg font-semibold text-purple-800">ניתוח אוטומטי של תמונת דירה</h3>
        <p className="text-sm text-purple-600">העלה תמונה או הכנס קישור לתמונה כדי לחלץ נתונים אוטומטית</p>
      </div>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <Label className="text-right block mb-2">העלאת תמונה</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={analyzing}
            className="block w-full text-sm text-purple-900 border border-purple-300 rounded-lg cursor-pointer bg-purple-50 focus:outline-none"
          />
        </div>

        {/* URL Input */}
        <div>
          <Label className="text-right block mb-2">או הכנס קישור לתמונה</Label>
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/apartment-image.jpg"
              disabled={analyzing}
              className="flex-1"
            />
            <Button
              onClick={handleUrlAnalysis}
              disabled={analyzing || !imageUrl.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              נתח
            </Button>
          </div>
        </div>

        {analyzing && (
          <div className="text-center py-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-500" />
            <p className="text-purple-600 mt-2">מנתח תמונה...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;
