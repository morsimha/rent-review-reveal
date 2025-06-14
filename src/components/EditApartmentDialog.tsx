import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/hooks/useApartments';
import PasswordPromptDialog from './PasswordPromptDialog';

interface EditApartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: Apartment | null;
  onSave: (apartmentId: string, updates: Partial<Apartment>) => void;
  uploadImage: (file: File) => Promise<string | null>;
  isAdd?: boolean;
}

const SECRET = "wika";

const EditApartmentDialog: React.FC<EditApartmentDialogProps> = ({
  isOpen,
  onClose,
  apartment,
  onSave,
  uploadImage,
  isAdd = false
}) => {
  const [editFormData, setEditFormData] = useState<Partial<Apartment>>({});
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Partial<Apartment>|null>(null);

  useEffect(() => {
    if (!isAdd && apartment) {
      setEditFormData({...apartment});
    } else if (isAdd) {
      setEditFormData({});
    }
  }, [apartment, isAdd, isOpen]);

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setEditFormData({...editFormData, image_url: uploadedUrl});
    }
    setEditUploadingImage(false);
  };

  const handleRequestSave = async () => {
    // בדיקה בסיסית
    if (!(isAdd ? editFormData.title : editFormData.title?.trim())) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }
    setPendingEditData(editFormData);
    setPasswordDialogOpen(true);
  };

  const handlePasswordPrompt = (password: string) => {
    if (password.trim() === SECRET) {
      if (isAdd) {
        onSave('', editFormData);
      } else if (apartment) {
        onSave(apartment.id, editFormData);
      }
      setPasswordDialogOpen(false);
      setPendingEditData(null);
      onClose();
    } else {
      toast({
        title: "סיסמה שגויה",
        description: "הפעולה בוטלה.",
        variant: "destructive"
      });
      setPasswordDialogOpen(false);
      setPendingEditData(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{isAdd ? "הוסף דירה" : "ערוך דירה"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-right">כותרת *</Label>
            <Input
              value={editFormData.title || ''}
              onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-right">מיקום</Label>
            <Input
              value={editFormData.location || ''}
              onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-right">מחיר</Label>
            <Input
              type="number"
              value={editFormData.price || ''}
              onChange={(e) => setEditFormData({...editFormData, price: e.target.value ? parseInt(e.target.value) : null})}
            />
          </div>
          <div>
            <Label className="text-right">תמונה</Label>
            <div className="flex gap-2">
              <Input
                value={editFormData.image_url || ''}
                onChange={(e) => setEditFormData({...editFormData, image_url: e.target.value})}
                placeholder="קישור לתמונה"
                className="flex-1"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                className="hidden"
                ref={editFileInputRef}
              />
              <Button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                disabled={editUploadingImage}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Upload className="w-4 h-4" />
                {editUploadingImage ? "מעלה..." : "העלה"}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-right">קישור לדירה</Label>
            <Input
              value={editFormData.apartment_link || ''}
              onChange={(e) => setEditFormData({...editFormData, apartment_link: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-right">מספר טלפון</Label>
            <Input
              value={editFormData.contact_phone || ''}
              onChange={(e) => setEditFormData({...editFormData, contact_phone: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-right">שם איש קשר</Label>
            <Input
              value={editFormData.contact_name || ''}
              onChange={(e) => setEditFormData({...editFormData, contact_name: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-right block mb-1">סטטוס</Label>
            <RadioGroup value={editFormData.status} onValueChange={(value: 'spoke' | 'not_spoke' | 'no_answer') => setEditFormData({...editFormData, status: value})}>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="spoke" id="edit_spoke" />
                  <Label htmlFor="edit_spoke" className="text-green-600">דיברנו</Label>
                </div>
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="not_spoke" id="edit_not_spoke" />
                  <Label htmlFor="edit_not_spoke" className="text-yellow-600">לא דיברנו</Label>
                </div>
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="no_answer" id="edit_no_answer" />
                  <Label htmlFor="edit_no_answer" className="text-red-600">לא ענו</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-right block mb-1">בעלי חיים</Label>
            <RadioGroup value={editFormData.pets_allowed} onValueChange={(value: 'yes' | 'no' | 'unknown') => setEditFormData({...editFormData, pets_allowed: value})}>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="yes" id="edit_pets_yes" />
                  <Label htmlFor="edit_pets_yes">כן 🐱</Label>
                </div>
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="no" id="edit_pets_no" />
                  <Label htmlFor="edit_pets_no">לא 🚫</Label>
                </div>
                <div className="flex flex-row-reverse items-center gap-2">
                  <RadioGroupItem value="unknown" id="edit_pets_unknown" />
                  <Label htmlFor="edit_pets_unknown">לא יודע</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-right block mb-1">יש מקלט?</Label>
            <RadioGroup value={editFormData.has_shelter === null || editFormData.has_shelter === undefined ? "" : editFormData.has_shelter ? "yes" : "no"}
              onValueChange={v => setEditFormData({...editFormData, has_shelter: v === "yes" ? true : v === "no" ? false : null})}
              className="flex flex-row gap-2 justify-end"
            >
              <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
                <Label htmlFor="edit_hasShelter_yes" className="text-green-600 flex items-center gap-1">כן <span className="text-lg">🏠</span></Label>
                <RadioGroupItem value="yes" id="edit_hasShelter_yes" />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
                <Label htmlFor="edit_hasShelter_no" className="text-gray-600">לא</Label>
                <RadioGroupItem value="no" id="edit_hasShelter_no" />
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-right block mb-1">תאריך כניסה</Label>
            <Input
              type="date"
              value={editFormData.entry_date || ''}
              onChange={e => setEditFormData({...editFormData, entry_date: e.target.value})}
              min={new Date().toISOString().split("T")[0]}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-right">תיאור</Label>
            <Textarea
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-right">הערה</Label>
            <Textarea
              value={editFormData.note || ''}
              onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleRequestSave} className="bg-purple-600 hover:bg-purple-700">
            שמור
          </Button>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
        </div>
        {/* דיאלוג לקבלת סיסמה */}
        <PasswordPromptDialog
          isOpen={passwordDialogOpen}
          onConfirm={handlePasswordPrompt}
          onCancel={() => setPasswordDialogOpen(false)}
          title="אימות סיסמה"
          confirmText="אישור"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditApartmentDialog;
