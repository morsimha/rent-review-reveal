
import React, { useState } from 'react';
import { Plus, Star, Trash2, Edit, Phone, Link, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface Apartment {
  id: string;
  fb_url: string;
  title: string;
  description: string;
  price?: number;
  location: string;
  image_url: string;
  rating: number;
  note: string;
  apartment_link: string;
  contact_phone: string;
  contact_name: string;
  status: 'spoke' | 'not_spoke';
  pets_allowed: 'yes' | 'no' | 'unknown';
  created_at: string;
}

const Index = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [apartmentLink, setApartmentLink] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [status, setStatus] = useState<'spoke' | 'not_spoke'>('not_spoke');
  const [petsAllowed, setPetsAllowed] = useState<'yes' | 'no' | 'unknown'>('unknown');
  
  const [apartments, setApartments] = useState<Apartment[]>([
    {
      id: '1',
      fb_url: 'https://www.facebook.com/groups/402682483445663/permalink/2466035413777016/',
      title: 'דירת 2 חדרים מהממת במרכז העיר',
      description: 'דירה מרווחת עם אמניטים מודרניים, קרוב לתחבורה ציבורית ומרכזי קניות.',
      price: 4500,
      location: 'מרכז העיר, תל אביב',
      image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4,
      note: 'מיקום מעולה, אולי קצת רועש',
      apartment_link: 'https://yad2.co.il/example1',
      contact_phone: '050-1234567',
      contact_name: 'דני כהן',
      status: 'spoke',
      pets_allowed: 'yes',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      fb_url: 'https://facebook.com/example2',
      title: 'סטודיו נעים ליד האוניברסיטה',
      description: 'מושלם לסטודנטים או צעירים עובדים. מרוהט לחלוטין עם כל השירותים כלולים.',
      price: 3200,
      location: 'רמת אביב',
      image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 5,
      note: 'גודל מושלם בשבילי, אוהבת את האזור',
      apartment_link: 'https://rent.co.il/example2',
      contact_phone: '052-9876543',
      contact_name: 'שרה לוי',
      status: 'not_spoke',
      pets_allowed: 'no',
      created_at: '2024-01-14T15:45:00Z'
    }
  ]);

  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Apartment>>({});
  const { toast } = useToast();

  const handleAddApartment = async () => {
    if (!title.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }

    const newApartment: Apartment = {
      id: Math.random().toString(36).substr(2, 9),
      fb_url: `https://facebook.com/generated-${Date.now()}`,
      title,
      description,
      price: price ? parseInt(price) : undefined,
      location,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 0,
      note: initialNote,
      apartment_link: apartmentLink,
      contact_phone: contactPhone,
      contact_name: contactName,
      status,
      pets_allowed: petsAllowed,
      created_at: new Date().toISOString()
    };

    setApartments(prev => [newApartment, ...prev]);

    toast({
      title: "הצלחה",
      description: "הדירה נוספה בהצלחה!",
    });

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
  };

  const handleRatingChange = (apartmentId: string, newRating: number) => {
    setApartments(prev => 
      prev.map(apt => 
        apt.id === apartmentId ? { ...apt, rating: newRating } : apt
      ).sort((a, b) => b.rating - a.rating)
    );
    
    toast({
      title: "הדירוג עודכן",
      description: `דירוג הדירה: ${newRating} כוכבים`,
    });
  };

  const handleEditApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setEditFormData({ ...apartment });
  };

  const handleSaveEdit = () => {
    if (!editingApartment || !editFormData.title?.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את שדה הכותרת",
        variant: "destructive"
      });
      return;
    }

    setApartments(prev => 
      prev.map(apt => 
        apt.id === editingApartment.id ? { ...apt, ...editFormData } : apt
      )
    );
    
    setEditingApartment(null);
    setEditFormData({});
    
    toast({
      title: "הדירה עודכנה",
      description: "הפרטים נשמרו בהצלחה",
    });
  };

  const handleDelete = (apartmentId: string) => {
    setApartments(prev => prev.filter(apt => apt.id !== apartmentId));
    
    toast({
      title: "הדירה נמחקה",
      description: "הדירה הוסרה מהרשימה",
    });
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Sort apartments by rating (highest first)
  const sortedApartments = [...apartments].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      {/* Cat Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🐱</div>
        <div className="absolute top-32 right-20 text-4xl">😸</div>
        <div className="absolute top-64 left-1/4 text-5xl">🐈</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">😻</div>
        <div className="absolute bottom-20 left-20 text-4xl">🐾</div>
        <div className="absolute top-1/2 right-10 text-5xl">🙀</div>
        <div className="absolute bottom-1/2 left-1/2 text-4xl">😺</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">מור וגבי מוצאים דירה</h1>
          <p className="text-purple-600 text-lg">וואו איזה ביתתת 🏠✨</p>
        </div>

        {/* Add Apartment Form */}
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
              <div>
                <Input
                  placeholder="קישור לתמונה"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white/70 border-purple-300 focus:border-purple-500"
                />
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
                <RadioGroup value={status} onValueChange={(value: 'spoke' | 'not_spoke') => setStatus(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spoke" id="spoke" />
                    <Label htmlFor="spoke" className="text-green-600">דיברנו</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_spoke" id="not_spoke" />
                    <Label htmlFor="not_spoke" className="text-yellow-600">לא דיברנו</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <RadioGroup value={petsAllowed} onValueChange={(value: 'yes' | 'no' | 'unknown') => setPetsAllowed(value)}>
                  <Label className="text-sm font-medium">בעלי חיים מותרים?</Label>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pets_yes" />
                    <Label htmlFor="pets_yes">כן 🐱</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pets_no" />
                    <Label htmlFor="pets_no">לא 🚫</Label>
                  </div>
                  <div className="flex items-center space-x-2">
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
              <Plus className="w-5 h-5 mr-2" />
              הוסף דירה
            </Button>
          </CardContent>
        </Card>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedApartments.map((apartment) => (
            <Card key={apartment.id} className="bg-white/90 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 aspect-square flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Status Bar */}
                <div className={`h-2 w-full rounded-t-lg ${
                  apartment.status === 'spoke' ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>

                {/* Image */}
                <div className="relative overflow-hidden flex-shrink-0" style={{height: '35%'}}>
                  <img
                    src={apartment.image_url}
                    alt={apartment.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {apartment.price && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                      ₪{apartment.price}
                    </div>
                  )}
                  {apartment.pets_allowed === 'yes' && (
                    <div className="absolute top-2 left-2 text-lg">🐱</div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  {/* Title and Description */}
                  <h3 className="font-bold text-sm mb-1 text-gray-800 line-clamp-1">{apartment.title}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-grow">{apartment.description}</p>
                  
                  {/* Location */}
                  {apartment.location && (
                    <p className="text-purple-600 text-xs mb-1 font-medium">{apartment.location}</p>
                  )}

                  {/* Contact Info */}
                  {(apartment.contact_name || apartment.contact_phone) && (
                    <div className="text-xs text-gray-700 mb-2">
                      {apartment.contact_name && <p>{apartment.contact_name}</p>}
                      {apartment.contact_phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{apartment.contact_phone}</p>}
                    </div>
                  )}

                  {/* Links */}
                  {apartment.apartment_link && (
                    <div className="mb-2">
                      <a href={apartment.apartment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        קישור לדירה
                      </a>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs font-medium text-gray-700">דירוג:</span>
                    <div className="scale-75">
                      <StarRating 
                        rating={apartment.rating} 
                        onRatingChange={(rating) => handleRatingChange(apartment.id, rating)}
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mb-2 flex-grow">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {apartment.note || 'אין הערות'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditApartment(apartment)}
                          className="h-6 px-2 text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          ערוך
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>ערוך דירה</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>כותרת *</Label>
                            <Input
                              value={editFormData.title || ''}
                              onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>מיקום</Label>
                            <Input
                              value={editFormData.location || ''}
                              onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>מחיר</Label>
                            <Input
                              type="number"
                              value={editFormData.price || ''}
                              onChange={(e) => setEditFormData({...editFormData, price: e.target.value ? parseInt(e.target.value) : undefined})}
                            />
                          </div>
                          <div>
                            <Label>קישור לתמונה</Label>
                            <Input
                              value={editFormData.image_url || ''}
                              onChange={(e) => setEditFormData({...editFormData, image_url: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>קישור לדירה</Label>
                            <Input
                              value={editFormData.apartment_link || ''}
                              onChange={(e) => setEditFormData({...editFormData, apartment_link: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>מספר טלפון</Label>
                            <Input
                              value={editFormData.contact_phone || ''}
                              onChange={(e) => setEditFormData({...editFormData, contact_phone: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>שם איש קשר</Label>
                            <Input
                              value={editFormData.contact_name || ''}
                              onChange={(e) => setEditFormData({...editFormData, contact_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>סטטוס</Label>
                            <RadioGroup value={editFormData.status} onValueChange={(value: 'spoke' | 'not_spoke') => setEditFormData({...editFormData, status: value})}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="spoke" id="edit_spoke" />
                                <Label htmlFor="edit_spoke" className="text-green-600">דיברנו</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="not_spoke" id="edit_not_spoke" />
                                <Label htmlFor="edit_not_spoke" className="text-yellow-600">לא דיברנו</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div>
                            <Label>בעלי חיים</Label>
                            <RadioGroup value={editFormData.pets_allowed} onValueChange={(value: 'yes' | 'no' | 'unknown') => setEditFormData({...editFormData, pets_allowed: value})}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="edit_pets_yes" />
                                <Label htmlFor="edit_pets_yes">כן 🐱</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="edit_pets_no" />
                                <Label htmlFor="edit_pets_no">לא 🚫</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unknown" id="edit_pets_unknown" />
                                <Label htmlFor="edit_pets_unknown">לא יודע</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="md:col-span-2">
                            <Label>תיאור</Label>
                            <Textarea
                              value={editFormData.description || ''}
                              onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>הערה</Label>
                            <Textarea
                              value={editFormData.note || ''}
                              onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" onClick={() => setEditingApartment(null)}>
                            ביטול
                          </Button>
                          <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">
                            שמור
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(apartment.id)}
                      className="bg-red-500 hover:bg-red-600 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {apartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-purple-600 text-lg">עדיין לא נוספו דירות. התחילו לחפש! 🏠</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
