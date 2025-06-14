
import React from 'react';
import { Trash2, Edit, Phone, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StarRating from './StarRating';
import type { Apartment } from '@/hooks/useApartments';

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (apartmentId: string) => void;
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  onEdit,
  onDelete,
  onMorRatingChange,
  onGabiRatingChange
}) => {
  const getStatusColor = (status: 'spoke' | 'not_spoke' | 'no_answer') => {
    switch (status) {
      case 'spoke': return 'bg-green-400';
      case 'not_spoke': return 'bg-yellow-400';
      case 'no_answer': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 h-[500px] flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Status Bar */}
        <div className={`h-2 w-full rounded-t-lg ${getStatusColor(apartment.status)}`}></div>

        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0 h-48">
          <img
            src={apartment.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
            alt={apartment.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {apartment.price && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-sm">
              ₪{apartment.price}
            </div>
          )}
          {apartment.pets_allowed === 'yes' && (
            <div className="absolute top-2 left-2 text-xl">🐱</div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* Title and Description */}
          <h3 className="font-bold text-base mb-2 text-gray-800 line-clamp-1 text-right">{apartment.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 text-right">{apartment.description}</p>
          
          {/* Location */}
          {apartment.location && (
            <p className="text-purple-600 text-sm mb-2 font-medium text-right">{apartment.location}</p>
          )}

          {/* Contact Info */}
          {(apartment.contact_name || apartment.contact_phone) && (
            <div className="text-sm text-gray-700 mb-3 text-right">
              {apartment.contact_name && <p className="mb-1">{apartment.contact_name}</p>}
              {apartment.contact_phone && <p className="flex items-center gap-1 justify-end"><Phone className="w-4 h-4" />{apartment.contact_phone}</p>}
            </div>
          )}

          {/* Links */}
          {apartment.apartment_link && (
            <div className="mb-3 text-right">
              <a href={apartment.apartment_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 justify-end">
                <Link className="w-4 h-4" />
                קישור לדירה
              </a>
            </div>
          )}

          {/* Ratings (Mor and Gabi only) */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <StarRating 
                rating={apartment.mor_rating || 0} 
                onRatingChange={(rating) => onMorRatingChange(apartment.id, rating)}
              />
              <span className="text-sm font-medium text-purple-600">:מור</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <StarRating 
                rating={apartment.gabi_rating || 0} 
                onRatingChange={(rating) => onGabiRatingChange(apartment.id, rating)}
              />
              <span className="text-sm font-medium text-pink-600">:גבי</span>
            </div>
          </div>

          {/* Note */}
          <div className="mb-4 flex-grow">
            <p className="text-sm text-gray-600 text-right break-words">
              {apartment.note || 'אין הערות'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-auto">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(apartment.id)}
              className="bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(apartment)}
              className="h-8 px-3 text-sm"
            >
              <Edit className="w-4 h-4 ml-1" />
              ערוך
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApartmentCard;
