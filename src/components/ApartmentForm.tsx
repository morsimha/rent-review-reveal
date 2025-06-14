
import React, { useState, useRef } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface ApartmentFormProps {
  onAddApartment: (apartmentData: any) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string | null>;
}

const ApartmentForm: React.FC<ApartmentFormProps> = ({ onAddApartment, uploadImage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [apartmentLink, setApartmentLink] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [status, setStatus] = useState<'spoke' | 'not_spoke' | 'no_answer'>('not_spoke');
  const [petsAllowed, setPetsAllowed] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
    }
    setUploadingImage(false);
  };

  const handleAddApartment = async () => {
    if (!title.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }

    const apartmentData = {
      fb_url: `https://facebook.com/generated-${Date.now()}`,
      title,
      description,
      price: price ? parseInt(price) : null,
      location,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 0,
      mor_rating: 0,
      gabi_rating: 0,
      note: initialNote,
      apartment_link: apartmentLink,
      contact_phone: contactPhone,
      contact_name: contactName,
      status,
      pets_allowed: petsAllowed,
    };

    await onAddApartment(apartmentData);

    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setImageUrl('');
    setInitialNote('');
    setApartmentLink('');
    setContactPhone('');
    setContactName('');
    setStatus('not_spoke');
    setPetsAllowed('unknown');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="כותרת הדירה *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div>
            <Input
              placeholder="מיקום"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div>
            <Input
              placeholder="מחיר (₪)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="קישור לתמונה"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500 flex-1"
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
          <div>
            <Input
              placeholder="קישור לדירה"
              value={apartmentLink}
              onChange={(e) => setApartmentLink(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div>
            <Input
              placeholder="מספר טלפון"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div>
            <Input
              placeholder="שם איש קשר"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500"
            />
          </div>
          <div>
            <RadioGroup value={status} onValueChange={(value: 'spoke' | 'not_spoke' | 'no_answer') => setStatus(value)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="spoke" id="spoke" />
                <Label htmlFor="spoke" className="text-green-600">דיברנו</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="not_spoke" id="not_spoke" />
                <Label htmlFor="not_spoke" className="text-yellow-600">לא דיברנו</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="no_answer" id="no_answer" />
                <Label htmlFor="no_answer" className="text-red-600">לא ענו</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <RadioGroup value={petsAllowed} onValueChange={(value: 'yes' | 'no' | 'unknown') => setPetsAllowed(value)}>
              <Label className="text-sm font-medium">בעלי חיים מותרים?</Label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="yes" id="pets_yes" />
                <Label htmlFor="pets_yes">כן 🐱</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="no" id="pets_no" />
                <Label htmlFor="pets_no">לא 🚫</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="unknown" id="pets_unknown" />
                <Label htmlFor="pets_unknown">לא יודע</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="md:col-span-2">
            <Textarea
              placeholder="תיאור הדירה"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500 resize-none"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              placeholder="הערה אישית"
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="bg-white/70 border-purple-300 focus:border-purple-500 resize-none"
              rows={2}
            />
          </div>
        </div>
        <Button 
          onClick={handleAddApartment}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-300"
        >
          <Plus className="w-5 h-5 ml-2" />
          הוסף דירה
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApartmentForm;
