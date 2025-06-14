
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
  const [fbUrl, setFbUrl] = useState('');
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
    if (!fbUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Facebook post URL",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Info",
      description: "To scrape Facebook posts and store data, please connect to Supabase first using the green button in the top right.",
    });

    // Reset form
    setFbUrl('');
    setInitialNote('');
  };

  const handleRatingChange = (apartmentId: string, newRating: number) => {
    setApartments(prev => 
      prev.map(apt => 
        apt.id === apartmentId ? { ...apt, rating: newRating } : apt
      ).sort((a, b) => b.rating - a.rating)
    );
    
    toast({
      title: "Rating updated",
      description: `Apartment rated ${newRating} stars`,
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
      title: "Note updated",
      description: "Your note has been saved",
    });
  };

  const handleDelete = (apartmentId: string) => {
    setApartments(prev => prev.filter(apt => apt.id !== apartmentId));
    
    toast({
      title: "Apartment deleted",
      description: "The apartment has been removed from your list",
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
          <p className="text-blue-200 text-lg">Find and rank your perfect apartment</p>
        </div>

        {/* Add Apartment Form */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Paste Facebook post link..."
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Initial note (optional)"
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 resize-none"
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleAddApartment}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Apartment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedApartments.map((apartment) => (
            <Card key={apartment.id} className="bg-white/95 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={apartment.image_url}
                    alt={apartment.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {apartment.price && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                      ${apartment.price}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Title and Description */}
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{apartment.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{apartment.description}</p>
                  
                  {/* Location */}
                  <p className="text-blue-600 text-sm mb-4 font-medium">{apartment.location}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <StarRating 
                      rating={apartment.rating} 
                      onRatingChange={(rating) => handleRatingChange(apartment.id, rating)}
                    />
                  </div>

                  {/* Note Section */}
                  <div className="mb-4">
                    {editingNote === apartment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNoteValue}
                          onChange={(e) => setEditNoteValue(e.target.value)}
                          className="w-full text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleNoteSave(apartment.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNote(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-gray-600 flex-1 min-h-[1.25rem]">
                          {apartment.note || 'No notes yet'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleNoteEdit(apartment.id, apartment.note)}
                          className="p-1 h-6 w-6"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(apartment.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {apartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No apartments added yet. Start by pasting a Facebook post link above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
