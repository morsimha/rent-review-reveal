
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Apartment } from '@/types/ApartmentTypes';

interface ApartmentFormFieldsProps {
  formData: Partial<Apartment>;
  setFormData: (value: React.SetStateAction<Partial<Apartment>>) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  idPrefix?: string;
}

const ApartmentFormFields: React.FC<ApartmentFormFieldsProps> = ({
  formData,
  setFormData,
  handleImageUpload,
  uploadingImage,
  fileInputRef,
  idPrefix = ""
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-right">כותרת *</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
          placeholder="כותרת הדירה *"
        />
      </div>
      <div>
        <Label className="text-right">מיקום</Label>
        <Input
          value={formData.location || ''}
          onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
          placeholder="מיקום"
        />
      </div>
      <div>
        <Label className="text-right">מחיר</Label>
        <Input
          type="number"
          value={formData.price ?? ''}
          onChange={(e) => setFormData(prev => ({...prev, price: e.target.value ? parseInt(e.target.value) : null}))}
          placeholder="מחיר (₪)"
        />
      </div>
      <div>
        <Label className="text-right">מחיר ארנונה</Label>
        <Input
          type="number"
          value={formData.arnona ?? ''}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              arnona:
                e.target.value === ''
                  ? null
                  : parseInt(e.target.value)
            }))
          }
          placeholder="מחיר ארנונה"
        />
      </div>
      <div>
        <Label className="text-right">מ"ר</Label>
        <Input
          type="number"
          value={formData.square_meters ?? ''}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              square_meters:
                e.target.value === ''
                  ? null
                  : parseInt(e.target.value)
            }))
          }
          placeholder="מטר מרובע"
        />
      </div>
      <div>
        <Label className="text-right">קומה</Label>
        <Input
          type="number"
          value={formData.floor ?? ''}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              floor:
                e.target.value === ''
                  ? null
                  : parseInt(e.target.value)
            }))
          }
          placeholder="קומה"
        />
      </div>
      <div>
        <Label className="text-right">תמונה</Label>
        <div className="flex gap-2">
          <Input
            value={formData.image_url || ''}
            onChange={(e) => setFormData(prev => ({...prev, image_url: e.target.value}))}
            placeholder="קישור לתמונה"
            className="flex-1"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Upload className="w-4 h-4" />
            {uploadingImage ? "מעלה..." : "העלה"}
          </Button>
        </div>
      </div>
      <div>
        <Label className="text-right">קישור לדירה</Label>
        <Input
          value={formData.apartment_link || ''}
          onChange={(e) => setFormData(prev => ({...prev, apartment_link: e.target.value}))}
          placeholder="קישור לדירה"
        />
      </div>
      <div>
        <Label className="text-right">מספר טלפון</Label>
        <Input
          value={formData.contact_phone || ''}
          onChange={(e) => setFormData(prev => ({...prev, contact_phone: e.target.value}))}
          placeholder="מספר טלפון"
        />
      </div>
      <div>
        <Label className="text-right">שם איש קשר</Label>
        <Input
          value={formData.contact_name || ''}
          onChange={(e) => setFormData(prev => ({...prev, contact_name: e.target.value}))}
          placeholder="שם איש קשר"
        />
      </div>
      <div>
        <Label className="text-right block mb-1">סטטוס</Label>
        <RadioGroup value={formData.status} onValueChange={(value: 'spoke' | 'not_spoke' | 'no_answer') => setFormData(prev => ({...prev, status: value}))}>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="spoke" id={`${idPrefix}spoke`} />
              <Label htmlFor={`${idPrefix}spoke`} className="text-green-600">דיברנו</Label>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="not_spoke" id={`${idPrefix}not_spoke`} />
              <Label htmlFor={`${idPrefix}not_spoke`} className="text-yellow-600">לא דיברנו</Label>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="no_answer" id={`${idPrefix}no_answer`} />
              <Label htmlFor={`${idPrefix}no_answer`} className="text-red-600">לא ענו</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label className="text-right block mb-1">בעלי חיים</Label>
        <RadioGroup value={formData.pets_allowed} onValueChange={(value: 'yes' | 'no' | 'unknown') => setFormData(prev => ({...prev, pets_allowed: value}))}>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="yes" id={`${idPrefix}pets_yes`} />
              <Label htmlFor={`${idPrefix}pets_yes`}>כן 🐱</Label>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="no" id={`${idPrefix}pets_no`} />
              <Label htmlFor={`${idPrefix}pets_no`}>לא 🚫</Label>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <RadioGroupItem value="unknown" id={`${idPrefix}pets_unknown`} />
              <Label htmlFor={`${idPrefix}pets_unknown`}>לא יודע</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label className="text-right block mb-1">יש מקלט?</Label>
        <RadioGroup value={formData.has_shelter === null || formData.has_shelter === undefined ? "" : formData.has_shelter ? "yes" : "no"}
          onValueChange={v => setFormData(prev => ({...prev, has_shelter: v === "yes" ? true : v === "no" ? false : null}))}
          className="flex flex-row gap-2 justify-end"
        >
          <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
            <Label htmlFor={`${idPrefix}hasShelter_yes`} className="text-green-600 flex items-center gap-1">כן <span className="text-lg">🏠</span></Label>
            <RadioGroupItem value="yes" id={`${idPrefix}hasShelter_yes`} />
          </div>
          <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
            <Label htmlFor={`${idPrefix}hasShelter_no`} className="text-gray-600">לא</Label>
            <RadioGroupItem value="no" id={`${idPrefix}hasShelter_no`} />
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label className="text-right block mb-1">תאריך כניסה</Label>
        <Input
          type="date"
          value={formData.entry_date || ''}
          onChange={e => setFormData(prev => ({...prev, entry_date: e.target.value}))}
          min={new Date().toISOString().split("T")[0]}
          className="bg-white/70 border-purple-300 focus:border-purple-500"
        />
      </div>
      <div className="md:col-span-2">
        <Label className="text-right">תיאור</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          rows={3}
          placeholder="תיאור הדירה"
        />
      </div>
      <div className="md:col-span-2">
        <Label className="text-right">הערה</Label>
        <Textarea
          value={formData.note || ''}
          onChange={(e) => setFormData(prev => ({...prev, note: e.target.value}))}
          rows={2}
          placeholder="הערה אישית"
        />
      </div>
    </div>
  );
};

export default ApartmentFormFields;
