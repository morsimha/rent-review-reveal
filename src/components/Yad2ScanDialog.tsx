import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { scanYad2Apartments, clearScannedApartments } from '@/api/scannedApartmentApi';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Trash2 } from 'lucide-react';

interface Yad2ScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: () => void;
}

interface ScanParameters {
  propertyType: 'rent' | 'sale';
  maxPrice: string;
  areas: string[];
  minRooms: string;
  maxRooms: string;
}

const Yad2ScanDialog: React.FC<Yad2ScanDialogProps> = ({
  open,
  onOpenChange,
  onScanComplete
}) => {
  const [scanParams, setScanParams] = useState<ScanParameters>({
    propertyType: 'rent',
    maxPrice: '5500',
    areas: ['גבעתיים', 'רמת גן'],
    minRooms: '2',
    maxRooms: 'none'
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const availableAreas = [
    'גבעתיים',
    'רמת גן', 
    'תל אביב',
    'פתח תקווה',
    'בני ברק',
    'גבעת שמואל',
    'קריית אונו',
    'רמת השרון',
    'הרצליה',
    'כפר סבא'
  ];

  const handleAreaToggle = (area: string) => {
    setScanParams(prev => ({
      ...prev,
      areas: prev.areas.includes(area) 
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await scanYad2Apartments(scanParams);
      
      toast({
        title: "סריקה הושלמה בהצלחה!",
        description: `${result.message} - נמצאו ${result.count} דירות`,
      });
      
      onScanComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Scan error:', error);
      
      let errorMessage = "לא ניתן לסרוק דירות כרגע";
      
      // Provide more specific error messages
      if (error.message?.includes('יד2 חוסם גישה')) {
        errorMessage = "יד2 חוסם גישה - נסה שוב מאוחר יותר או בדוק את הקריטריונים";
      } else if (error.message?.includes('לא נמצאו דירות')) {
        errorMessage = "לא נמצאו דירות ביד2 לפי הקריטריונים - נסה לשנות את הפרמטרים";
      } else if (error.message?.includes('שגיאה 403') || error.message?.includes('שגיאה 429')) {
        errorMessage = "יד2 חוסם את הבקשה - נסה שוב מאוחר יותר";
      }
      
      toast({
        title: "שגיאה בסריקה",
        description: errorMessage,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Search className="w-5 h-5" />
            סריקת דירות אוטומטית מYad2
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Type */}
          <div className="space-y-2">
            <Label>סוג נכס</Label>
            <Select 
              value={scanParams.propertyType} 
              onValueChange={(value: 'rent' | 'sale') => 
                setScanParams(prev => ({ ...prev, propertyType: value }))
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">השכרה</SelectItem>
                <SelectItem value="sale">מכירה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label>מחיר מקסימלי (₪)</Label>
            <Input
              type="number"
              value={scanParams.maxPrice}
              onChange={(e) => setScanParams(prev => ({ ...prev, maxPrice: e.target.value }))}
              placeholder="5500"
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Areas */}
          <div className="space-y-2">
            <Label>אזורים ({scanParams.areas.length} נבחרו)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {availableAreas.map(area => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanParams.areas.includes(area)}
                    onChange={() => handleAreaToggle(area)}
                    className="rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מספר חדרים מינימלי</Label>
              <Select 
                value={scanParams.minRooms} 
                onValueChange={(value) => 
                  setScanParams(prev => ({ ...prev, minRooms: value }))
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">הכל</SelectItem>
                  <SelectItem value="1">1 חדר</SelectItem>
                  <SelectItem value="2">2 חדרים</SelectItem>
                  <SelectItem value="3">3 חדרים</SelectItem>
                  <SelectItem value="4">4 חדרים</SelectItem>
                  <SelectItem value="5">5+ חדרים</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>מספר חדרים מקסימלי</Label>
              <Select 
                value={scanParams.maxRooms} 
                onValueChange={(value) => 
                  setScanParams(prev => ({ ...prev, maxRooms: value }))
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">הכל</SelectItem>
                  <SelectItem value="1">1 חדר</SelectItem>
                  <SelectItem value="2">2 חדרים</SelectItem>
                  <SelectItem value="3">3 חדרים</SelectItem>
                  <SelectItem value="4">4 חדרים</SelectItem>
                  <SelectItem value="5">5+ חדרים</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                disabled={isScanning || scanParams.areas.length === 0}
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
