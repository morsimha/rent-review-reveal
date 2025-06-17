
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Wand2, Share, Download, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ApartmentDesignerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApartmentDesigner: React.FC<ApartmentDesignerProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [designedImageData, setDesignedImageData] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      setDesignedImageData(''); // Reset designed image
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `apartment-${Date.now()}.${fileExt}`;
      
      // שימוש ב-bucket קיים במקום יצירת חדש
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-images') // השתמש ב-bucket קיים
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleDesignApartment = async () => {
    if (!selectedImage) {
      toast({
        title: "לא נבחרה תמונה",
        description: "אנא בחר תמונת דירה קודם",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setIsDesigning(true);

    try {
      // Upload image to Supabase Storage first
      const uploadedUrl = await uploadImageToSupabase(selectedImage);
      
      if (!uploadedUrl) {
        throw new Error('Failed to upload image');
      }

      // Call the design apartment function
      const { data, error } = await supabase.functions.invoke('design-apartment', {
        body: { 
          imageUrl: uploadedUrl,
          customPrompt: customPrompt.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        setDesignedImageData(data.designedImageData);
        toast({
          title: "🎨 העיצוב הושלם!",
          description: "הדירה עוצבה מחדש בהצלחה",
        });
      } else {
        throw new Error(data.error || 'Design failed');
      }
    } catch (error) {
      console.error('Error designing apartment:', error);
      toast({
        title: "שגיאה בעיצוב",
        description: "לא הצלחנו לעצב את הדירה. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsDesigning(false);
    }
  };

  const handleShare = async () => {
    if (!designedImageData) return;

    try {
      // Convert base64 to blob for sharing
      const response = await fetch(`data:image/png;base64,${designedImageData}`);
      const blob = await response.blob();
      const file = new File([blob], 'designed-apartment.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'הדירה המעוצבת שלי',
          text: 'תראו איך AI עיצב את הדירה שלי!',
          files: [file]
        });
      } else {
        // Fallback - copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        toast({
          title: "הועתק ללוח!",
          description: "התמונה הועתקה ללוח. אפשר להדביק בכל מקום!",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "שגיאה בשיתוף",
        description: "לא הצלחנו לשתף את התמונה",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!designedImageData) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${designedImageData}`;
    link.download = 'designed-apartment.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "התמונה הורדה!",
      description: "התמונה המעוצבת נשמרה במכשיר שלך",
    });
  };

  const resetDesigner = () => {
    setSelectedImage(null);
    setOriginalImageUrl('');
    setDesignedImageData('');
    setCustomPrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            🎨 מעצב דירות AI ✨
            <p className="text-sm font-normal text-gray-600 mt-1">
              העלה תמונת דירה וקבל עיצוב מודרני מדהים!
            </p>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isDesigning}
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedImage ? 'החלף תמונה' : 'בחר תמונת דירה'}
              </Button>
              
              {selectedImage && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ נבחר: {selectedImage.name}
                </p>
              )}
            </div>

            {/* Custom Prompt Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                פרומפט מותאם אישית (אופציונלי):
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="תאר איך תרצה שהדירה תיראה... (אם תשאיר ריק, נשתמש בעיצוב מודרני ברירת מחדל)"
                className="min-h-20 text-right"
                disabled={isDesigning}
              />
              <p className="text-xs text-gray-500">
                דוגמה: "עיצוב מינימליסטי בגוונים של כחול ולבן, עם הרבה צמחים וריהוט סקנדינבי"
              </p>
            </div>
          </div>

          {/* Design Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleDesignApartment}
              disabled={!selectedImage || isDesigning}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8 py-3"
            >
              {isDesigning ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  {isUploading ? 'מעלה תמונה...' : 'מעצב...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  עצב דירה ✨
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            {originalImageUrl && (
              <div className="space-y-2">
                <h3 className="font-semibold text-center">תמונה מקורית</h3>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={originalImageUrl}
                    alt="תמונה מקורית"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Designed Image */}
            {designedImageData && (
              <div className="space-y-2">
                <h3 className="font-semibold text-center">תמונה מעוצבת</h3>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={`data:image/png;base64,${designedImageData}`}
                    alt="תמונה מעוצבת"
                    className="w-full h-64 object-cover"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    onClick={handleShare}
                    className="bg-blue-500 hover:bg-blue-600"
                    size="sm"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    שתף
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-green-500 hover:bg-green-600"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    הורד
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          {(selectedImage || designedImageData) && (
            <div className="flex justify-center">
              <Button
                onClick={resetDesigner}
                variant="outline"
                disabled={isDesigning}
              >
                התחל מחדש
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentDesigner;
