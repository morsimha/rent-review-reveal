
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Apartment } from '@/types/ApartmentTypes';

interface TinderCardProps {
  apartment: Apartment | any;
  mode: 'regular' | 'scanned';
  dragOffset: number;
  swipeDirection: 'left' | 'right' | null;
  onMouseStart: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

const TinderCard: React.FC<TinderCardProps> = ({
  apartment,
  mode,
  dragOffset,
  swipeDirection,
  onMouseStart,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const getStatusColor = (status: "spoke" | "not_spoke" | "no_answer") => {
    switch (status) {
      case "spoke": return "bg-green-400";
      case "not_spoke": return "bg-yellow-400";
      case "no_answer": return "bg-red-400";
      default: return "bg-gray-400";
    }
  };

  // For scanned apartments, we need to handle the different data structure
  const displayApartment = mode === 'scanned' ? {
    ...apartment,
    status: 'not_spoke' as const, // Default status for scanned apartments
  } : apartment;

  return (
    <div className="relative h-[500px] mb-6">
      {/* Swipe Indicators */}
      {swipeDirection && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className={`text-6xl font-bold p-4 rounded-full border-4 ${
              swipeDirection === 'right'
                ? 'text-green-500 border-green-500 bg-green-50'
                : 'text-red-500 border-red-500 bg-red-50'
            }`}
          >
            {swipeDirection === 'right' ? '💚' : '💔'}
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card
        className="absolute inset-0 bg-white/90 backdrop-blur-sm border-purple-200 cursor-grab active:cursor-grabbing transition-transform duration-200 select-none"
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
          zIndex: 10,
          opacity: Math.abs(dragOffset) > 150 ? 0.7 : 1
        }}
        onMouseDown={onMouseStart}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Status Bar */}
          <div className={`h-2 w-full rounded-t-lg ${getStatusColor(displayApartment.status)}`} />
          
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            {displayApartment.image_url ? (
              <img
                src={displayApartment.image_url}
                alt={displayApartment.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-6xl">🏠</span>
              </div>
            )}
            
            {/* Price overlay */}
            {displayApartment.price && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                ₪{displayApartment.price.toLocaleString()}
              </div>
            )}

            {/* Scanned indicator */}
            {mode === 'scanned' && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Yad2
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-1">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{displayApartment.title}</h3>
            
            {displayApartment.location && (
              <p className="text-gray-600 text-sm mb-2">📍 {displayApartment.location}</p>
            )}
            
            {displayApartment.description && (
              <p className="text-gray-700 text-sm line-clamp-3 mb-3">{displayApartment.description}</p>
            )}

            {/* Details */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {displayApartment.square_meters && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {displayApartment.square_meters} מ"ר
                </span>
              )}
              {displayApartment.floor && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  קומה {displayApartment.floor}
                </span>
              )}
              {displayApartment.pets_allowed !== 'unknown' && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {displayApartment.pets_allowed === 'yes' ? '🐕 חיות מותרות' : '🚫 ללא חיות'}
                </span>
              )}
              {mode === 'scanned' && displayApartment.apartment_link && (
                <a 
                  href={displayApartment.apartment_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 קישור מקורי
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TinderCard;
