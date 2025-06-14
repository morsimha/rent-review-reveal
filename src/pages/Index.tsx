
import React, { useState } from 'react';
import { Plus, Star, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  created_at: string;
}

const Index = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [apartments, setApartments] = useState<Apartment[]>([
    {
      id: '1',
      fb_url: 'https://www.facebook.com/groups/402682483445663/permalink/2466035413777016/',
      title: 'Beautiful 2BR Apartment in Downtown',
      description: 'Spacious apartment with modern amenities, close to public transport and shopping centers.',
      price: 1200,
      location: 'Downtown, City Center',
      image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4,
      note: 'Great location, might be a bit noisy',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      fb_url: 'https://facebook.com/example2',
      title: 'Cozy Studio Near University',
      description: 'Perfect for students or young professionals. Fully furnished with all utilities included.',
      price: 800,
      location: 'University District',
      image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 5,
      note: 'Perfect size for me, love the area',
      created_at: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      fb_url: 'https://facebook.com/example3',
      title: '3BR Family House with Garden',
      description: 'Spacious family home with private garden, parking space, and quiet neighborhood.',
      price: 1800,
      location: 'Suburbia Heights',
      image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 3,
      note: 'Nice but too far from work',
      created_at: '2024-01-13T09:20:00Z'
    }
  ]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteValue, setEditNoteValue] = useState('');
  const { toast } = useToast();

  const handleAddApartment = async () => {
    if (!title.trim() || !location.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא לפחות את שדות הכותרת והמיקום",
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

  const handleNoteEdit = (apartmentId: string, currentNote: string) => {
    setEditingNote(apartmentId);
    setEditNoteValue(currentNote);
  };

  const handleNoteSave = (apartmentId: string) => {
    setApartments(prev => 
      prev.map(apt => 
        apt.id === apartmentId ? { ...apt, note: editNoteValue } : apt
      )
    );
    setEditingNote(null);
    setEditNoteValue('');
    
    toast({
      title: "ההערה עודכנה",
      description: "ההערה נשמרה בהצלחה",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Rental Ranker</h1>
          <p className="text-blue-200 text-lg">מצא ודרג את הדירה המושלמת</p>
        </div>

        {/* Add Apartment Form */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="כותרת הדירה *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  placeholder="מיקום *"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  placeholder="מחיר (₪)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  placeholder="קישור לתמונה (אופציונלי)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  placeholder="תיאור הדירה"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 resize-none"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  placeholder="הערה אישית (אופציונלי)"
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 resize-none"
                  rows={2}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddApartment}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              הוסף דירה
            </Button>
          </CardContent>
        </Card>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedApartments.map((apartment) => (
            <Card key={apartment.id} className="bg-white/95 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 aspect-square flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Image */}
                <div className="relative overflow-hidden rounded-t-lg flex-shrink-0" style={{height: '40%'}}>
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
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  {/* Title and Description */}
                  <h3 className="font-bold text-sm mb-1 text-gray-800 line-clamp-1">{apartment.title}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-grow">{apartment.description}</p>
                  
                  {/* Location */}
                  <p className="text-blue-600 text-xs mb-2 font-medium">{apartment.location}</p>

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

                  {/* Note Section */}
                  <div className="mb-2 min-h-[2rem]">
                    {editingNote === apartment.id ? (
                      <div className="space-y-1">
                        <Textarea
                          value={editNoteValue}
                          onChange={(e) => setEditNoteValue(e.target.value)}
                          className="w-full text-xs h-12"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleNoteSave(apartment.id)}
                            className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1 h-6"
                          >
                            שמור
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNote(null)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            ביטול
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1">
                        <p className="text-xs text-gray-600 flex-1 min-h-[1rem] line-clamp-2">
                          {apartment.note || 'אין הערות'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleNoteEdit(apartment.id, apartment.note)}
                          className="p-0 h-4 w-4 min-w-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-auto">
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
            <p className="text-white/70 text-lg">עדיין לא נוספו דירות. התחל על ידי מילוי הטופס למעלה!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
