
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { scanYad2Apartments, clearScannedApartments } from '@/api/scannedApartmentApi';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Trash2 } from 'lucide-react';

interface Yad2ScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: () => void;
}

const Yad2ScanDialog: React.FC<Yad2ScanDialogProps> = ({
  open,
  onOpenChange,
  onScanComplete
}) => {
  const [searchQuery, setSearchQuery] = useState(
    'דירות להשכרה עד 5600 שקלים, בגבעתיים או רמת גן, 2 חדרים ומעלה'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await scanYad2Apartments(searchQuery);
      
      toast({
        title: "סריקה הושלמה בהצלחה!",
        description: `נמצאו ${result.count} דירות חדשות`,
      });
      
      onScanComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "שגיאה בסריקה",
        description: "לא ניתן לסרוק דירות כרגע",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearScannedApartments();
      
      toast({
        title: "נמחקו כל הדירות הסרוקות",
        description: "ניתן לסרוק דירות חדשות",
      });
      
      onScanComplete();
    } catch (error) {
      toast({
        title: "שגיאה במחיקה",
        description: "לא ניתן למחוק את הדירות הסרוקות",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Search className="w-5 h-5" />
            סריקת דירות אוטומטית מYad2
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              קריטריוני חיפוש (בשפה חופשית)
            </label>
            <Textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="דירות להשכרה עד 5600 שקלים, בגבעתיים או רמת גן, 2 חדרים ומעלה"
              className="text-right h-24"
              dir="rtl"
            />
            <p className="text-xs text-gray-500 mt-1">
              הסריקה תחפש עד 10 דירות בכל פעם לפי הקריטריונים שהזנת
            </p>
          </div>

          <div className="flex gap-3 justify-between">
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isClearing || isScanning}
              className="flex items-center gap-2"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              מחק דירות סרוקות
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                disabled={isScanning}
              >
                ביטול
              </Button>
              <Button
                onClick={handleScan}
                disabled={isScanning || !searchQuery.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    סורק...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    סרוק דירות
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Yad2ScanDialog;
