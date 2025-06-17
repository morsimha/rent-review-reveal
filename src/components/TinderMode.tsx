import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw, Star } from 'lucide-react';
import type { Apartment } from '@/types/ApartmentTypes';
import { useTheme } from '@/contexts/ThemeContext';

interface TinderModeProps {
  apartments: Apartment[];
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  isAuthenticated: boolean;
}

const TinderMode: React.FC<TinderModeProps> = ({
  apartments,
  onMorRatingChange,
  onGabiRatingChange,
  isAuthenticated
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const { themeConfig } = useTheme();

  const currentApartment = apartments[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX.current;
    setDragOffset(offset);
    
    // Determine swipe direction
    if (Math.abs(offset) > 50) {
      setSwipeDirection(offset > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If swipe is strong enough, trigger action
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    
    // Reset
    setDragOffset(0);
    setSwipeDirection(null);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const offset = e.clientX - startX.current;
    setDragOffset(offset);
    
    if (Math.abs(offset) > 50) {
      setSwipeDirection(offset > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    
    setDragOffset(0);
    setSwipeDirection(null);
  };

  const handleLike = () => {
    // In Tinder mode, don't actually update ratings - just for viewing
    nextCard();
  };

  const handleDislike = () => {
    // In Tinder mode, don't actually update ratings - just for viewing
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < apartments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const getStatusColor = (status: "spoke" | "not_spoke" | "no_answer") => {
    switch (status) {
      case "spoke": return "bg-green-400";
      case "not_spoke": return "bg-yellow-400";
      case "no_answer": return "bg-red-400";
      default: return "bg-gray-400";
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const offset = e.clientX - startX.current;
        setDragOffset(offset);
        
        if (Math.abs(offset) > 50) {
          setSwipeDirection(offset > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!currentApartment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className={`text-2xl font-bold ${themeConfig.textColor} mb-4`}>
          סיימת לעבור על כל הדירות!
        </h3>
        <p className={`${themeConfig.accentColor} mb-6`}>
          לחץ על כפתור האיפוס כדי להתחיל מהתחלה
        </p>
        <Button
          onClick={handleReset}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          התחל מחדש
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${themeConfig.accentColor}`}>
            {currentIndex + 1} / {apartments.length}
          </span>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            איפוס
          </Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / apartments.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[500px] mb-6">
        {/* Background cards for stack effect */}
        {apartments.slice(currentIndex + 1, currentIndex + 3).map((_, index) => (
          <Card
            key={`bg-${currentIndex + index + 1}`}
            className="absolute inset-0 bg-white/60 border-purple-200"
            style={{
              transform: `scale(${0.95 - index * 0.05}) translateY(${(index + 1) * 8}px)`,
              zIndex: 1 + index
            }}
          >
            <CardContent className="h-full" />
          </Card>
        ))}

        {/* Main Card */}
        <Card
          ref={cardRef}
          className="absolute inset-0 bg-white/90 backdrop-blur-sm border-purple-200 cursor-grab active:cursor-grabbing transition-transform duration-200 select-none"
          style={{
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
            zIndex: 10,
            opacity: Math.abs(dragOffset) > 150 ? 0.7 : 1
          }}
          onMouseDown={handleMouseStart}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <CardContent className="p-0 h-full flex flex-col">
            {/* Status Bar */}
            <div className={`h-2 w-full rounded-t-lg ${getStatusColor(currentApartment.status)}`} />
            
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              {currentApartment.image_url ? (
                <img
                  src={currentApartment.image_url}
                  alt={currentApartment.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-6xl">🏠</span>
                </div>
              )}
              
              {/* Price overlay */}
              {currentApartment.price && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                  ₪{currentApartment.price.toLocaleString()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{currentApartment.title}</h3>
              
              {currentApartment.location && (
                <p className="text-gray-600 text-sm mb-2">📍 {currentApartment.location}</p>
              )}
              
              {currentApartment.description && (
                <p className="text-gray-700 text-sm line-clamp-3 mb-3">{currentApartment.description}</p>
              )}

              {/* Details */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {currentApartment.square_meters && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {currentApartment.square_meters} מ"ר
                  </span>
                )}
                {currentApartment.floor && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    קומה {currentApartment.floor}
                  </span>
                )}
                {currentApartment.pets_allowed !== 'unknown' && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {currentApartment.pets_allowed === 'yes' ? '🐕 חיות מותרות' : '🚫 ללא חיות'}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Action Buttons - Swapped order */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleLike}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-green-500 text-green-500 hover:bg-green-50"
        >
          <Heart className="w-8 h-8" />
        </Button>
        
        <Button
          onClick={handleDislike}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-50"
        >
          <X className="w-8 h-8" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          🤏 גרור ימינה לחיבה, שמאלה לדחייה
        </p>
        <p className="text-xs text-blue-600 mt-1">
          מצב צפייה בלבד - הדירוגים לא נשמרים
        </p>
      </div>
    </div>
  );
};

export default TinderMode;
