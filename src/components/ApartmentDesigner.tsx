
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Wand2, Share, Download, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import PasswordDialog from '@/components/PasswordDialog';

interface ApartmentDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  uploadImage?: (file: File) => Promise<string | null>; // אופציונלי - אם מועבר מבחוץ
}

const ApartmentDesigner: React.FC<ApartmentDesignerProps> = ({ isOpen, onClose, uploadImage }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [designedImageData, setDesignedImageData] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Rate limiting state
  const [usageCount, setUsageCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());

  // טעינת נתוני rate limit מ-localStorage בטעינה ראשונית ובכל פתיחה
  useEffect(() => {
    if (isOpen) {
      const savedLastReset = localStorage.getItem('designerLastReset');
      const savedUsageCount = localStorage.getItem('designerUsageCount');
      
      if (savedLastReset) {
        const resetTime = parseInt(savedLastReset);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        // אם עברו 30 דקות, אפס
        if (now - resetTime > thirtyMinutes) {
          setUsageCount(0);
          setLastResetTime(now);
          localStorage.setItem('designerLastReset', now.toString());
          localStorage.setItem('designerUsageCount', '0');
        } else {
          // אחרת, טען את הנתונים השמורים
          setLastResetTime(resetTime);
          setUsageCount(parseInt(savedUsageCount || '0'));
        }
      } else {
        // אם אין נתונים שמורים, אתחל
        const now = Date.now();
        setLastResetTime(now);
        localStorage.setItem('designerLastReset', now.toString());
        localStorage.setItem('designerUsageCount', '0');
      }
    }
  }, [isOpen]);

  // איפוס אימות כשנסגר הדיאלוג
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setSelectedImage(null);
      setOriginalImageUrl('');
      setDesignedImageData('');
      setCustomPrompt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  // בדיקת rate limit
  const checkRateLimit = () => {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 דקות במילישניות
    
    // אם עברו 30 דקות, אפס את המונה
    if (now - lastResetTime > thirtyMinutes) {
      setUsageCount(0);
      setLastResetTime(now);
      localStorage.setItem('designerLastReset', now.toString());
      localStorage.setItem('designerUsageCount', '0');
      return true; // יכול להשתמש
    }
    
    // בדוק אם המשתמש הגיע למגבלה
    if (usageCount >= 2) {
      const timeLeft = Math.ceil((thirtyMinutes - (now - lastResetTime)) / 60000); // דקות שנותרו
      toast({
        title: "הגעת למגבלת השימוש 🔒",
        description: `תוכל לעצב עוד ${timeLeft} דקות. המגבלה היא 2 עיצובים כל 30 דקות.`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === 'wika') {
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      toast({
        title: "התחברת בהצלחה! 🎉",
        description: "כעת תוכל להשתמש במעצב הדירות",
      });
    } else {
      toast({
        title: "סיסמא שגויה",
        description: "אנא נסה שוב",
        variant: "destructive"
      });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // בדוק אם המשתמש מאומת
    if (!isAuthenticated) {
      setIsPasswordDialogOpen(true);
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      setDesignedImageData(''); // Reset designed image
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    // אם יש פונקציית uploadImage מבחוץ, נשתמש בה
    if (uploadImage) {
      return await uploadImage(file);
    }

    // אחרת, ננסה לבד
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('יש להתחבר כדי להעלות תמונות');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // ננסה כמה אפשרויות של bucket names
      const bucketOptions = ['apartments', 'apartment_images', 'apartment-images'];
      let uploadSuccess = false;
      let publicUrl = '';
      let lastError: any = null;
      
      for (const bucketName of bucketOptions) {
        try {
          console.log(`Trying bucket: ${bucketName}`);
          
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file);

          if (error) {
            console.log(`Failed with ${bucketName}:`, error.message);
            lastError = error;
            continue;
          }

          // הצלחנו!
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
          
          publicUrl = urlData.publicUrl;
          uploadSuccess = true;
          console.log('Upload successful to bucket:', bucketName);
          break;
        } catch (err) {
          console.log(`Error with ${bucketName}:`, err);
          lastError = err;
        }
      }
      
      if (!uploadSuccess) {
        throw new Error(lastError?.message || 'לא הצלחנו להעלות לאף אחד מה-buckets. אנא בדוק את הגדרות ה-Storage ב-Supabase.');
      }
      
      return publicUrl;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה בהעלאת תמונה",
        description: error instanceof Error ? error.message : "שגיאה לא ידועה",
        variant: "destructive"
      });
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

    // בדוק rate limit
    if (!checkRateLimit()) {
      return;
    }

    setIsUploading(true);
    setIsDesigning(true);

    try {
      console.log('Starting design process...');
      
      // במקום להעלות ל-storage, נמיר את התמונה ל-base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          setIsUploading(false);
          
          console.log('Calling design-apartment function...');
          
          // נשתמש ב-base64 במקום URL
          const { data, error } = await supabase.functions.invoke('design-apartment', {
            body: { 
              imageUrl: base64Image, // שולחים את ה-base64 ישירות
              customPrompt: customPrompt.trim()
            }
          });

          console.log('Function response:', { data, error });

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(`Function error: ${error.message}`);
          }

          if (data?.success) {
            setDesignedImageData(data.designedImageData);
            
            // עדכן את המונה והשמור ב-localStorage
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            localStorage.setItem('designerUsageCount', newCount.toString());
            
            // אם זה הפעם הראשונה, שמור גם את הזמן
            if (usageCount === 0) {
              const now = Date.now();
              setLastResetTime(now);
              localStorage.setItem('designerLastReset', now.toString());
            }
            
            toast({
              title: "🎨 העיצוב הושלם!",
              description: `הדירה עוצבה מחדש בהצלחה! (${newCount}/2 השתמשת)`,
            });
          } else {
            console.error('Design failed:', data);
            throw new Error(data?.error || 'Design failed');
          }
        } catch (err) {
          console.error('Error in design process:', err);
          toast({
            title: "שגיאה בעיצוב",
            description: err instanceof Error ? err.message : "שגיאה לא ידועה",
            variant: "destructive"
          });
        } finally {
          setIsDesigning(false);
        }
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        setIsDesigning(false);
        toast({
          title: "שגיאה בקריאת הקובץ",
          description: "לא הצלחנו לקרוא את הקובץ",
          variant: "destructive"
        });
      };
      
    } catch (error) {
      console.error('Error:', error);
      setIsUploading(false);
      setIsDesigning(false);
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "שגיאה לא ידועה",
        variant: "destructive"
      });
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
    <>
      {/* Password Dialog */}
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onPasswordSubmit={handlePasswordSubmit}
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              🎨 מעצב דירות AI ✨
              <p className="text-sm font-normal text-gray-600 mt-1">
                העלה תמונת דירה וקבל עיצוב מודרני מדהים!
              </p>
              {/* הצגת מונה שימוש */}
              <p className="text-xs font-normal mt-2">
                {(() => {
                  // בדיקה דינמית של המצב הנוכחי
                  const now = Date.now();
                  const thirtyMinutes = 30 * 60 * 1000;
                  const timePassed = now - lastResetTime;
                  
                  // אם עברו 30 דקות, הצג שיש 2 שימושים פנויים
                  if (timePassed > thirtyMinutes) {
                    return <span className="text-green-600">יש לך 2 עיצובים זמינים (מתאפס כל 30 דקות)</span>;
                  }
                  
                  // אחרת, הצג לפי המונה
                  if (usageCount < 2) {
                    return (
                      <span className="text-green-600">
                        נותרו לך {2 - usageCount} עיצובים מתוך 2 (מתאפס בעוד {Math.ceil((thirtyMinutes - timePassed) / 60000)} דקות)
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-red-600">
                        הגעת למגבלת השימוש. נסה שוב בעוד {Math.ceil((thirtyMinutes - timePassed) / 60000)} דקות
                      </span>
                    );
                  }
                })()}
              </p>
            </DialogTitle>
          </DialogHeader>
          
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                כדי להשתמש במעצב הדירות, נדרשת הזנת סיסמא
              </p>
              <Button
                onClick={() => setIsPasswordDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                הזן סיסמא לגישה
              </Button>
            </div>
          ) : (
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
                      {isUploading ? 'מעלה תמונה...' : 'מעצב עם AI...'}
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
              
              {/* Debug Info */}
              {isDesigning && (
                <div className="text-xs text-gray-500 text-center">
                  {isUploading ? 'מעלה תמונה לשרת...' : 'שולח ל-AI לעיצוב...'}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApartmentDesigner;
