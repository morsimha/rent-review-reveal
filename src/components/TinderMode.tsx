
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw, Star } from 'lucide-react';
import type { Apartment } from '@/types/ApartmentTypes';
import { useTheme } from '@/contexts/ThemeContext';

interface TinderModeProps {
  apartments: Apartment[];
  scannedApartments?: any[]; // New prop for scanned apartments
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  onLikeScanned?: (apartment: any) => void; // New prop for liking scanned apartments
  isAuthenticated: boolean;
  mode?: 'regular' | 'scanned'; // New prop to determine mode
}

const TinderMode: React.FC<TinderModeProps> = ({
  apartments,
  scannedApartments = [],
  onMorRatingChange,
  onGabiRatingChange,
  onLikeScanned,
  isAuthenticated,
  mode = 'regular'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [activeMode, setActiveMode] = useState<'regular' | 'scanned'>(mode);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const { themeConfig } = useTheme();

  // Use scanned apartments when in scanned mode
  const currentApartments = activeMode === 'scanned' ? scannedApartments : apartments;
  const currentApartment = currentApartments[currentIndex];

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
    if (activeMode === 'scanned' && onLikeScanned && currentApartment) {
      // Like scanned apartment - add to main apartments
      onLikeScanned(currentApartment);
    }
    // In regular mode or after liking, just move to next card
    nextCard();
  };

  const handleDislike = () => {
    // In both modes, just move to next card without doing anything
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < currentApartments.length - 1) {
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

  const switchMode = (newMode: 'regular' | 'scanned') => {
    setActiveMode(newMode);
    setCurrentIndex(0); // Reset to first card when switching modes
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Tindira Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            💕 Tindira Is Back 💕
          </h1>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            onClick={() => switchMode('regular')}
            variant={activeMode === 'regular' ? 'default' : 'outline'}
            className={`${
              activeMode === 'regular' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'border-purple-300 text-purple-600'
            }`}
          >
            דירות רגילות ({apartments.length})
          </Button>
          <Button
            onClick={() => switchMode('scanned')}
            variant={activeMode === 'scanned' ? 'default' : 'outline'}
            className={`${
              activeMode === 'scanned' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'border-blue-300 text-blue-600'
            }`}
          >
            דירות סרוקות ({scannedApartments.length})
          </Button>
        </div>

        {!currentApartment ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className={`text-2xl font-bold ${themeConfig.textColor} mb-4`}>
              {activeMode === 'scanned' ? 'סיימת לעבור על כל הדירות הסרוקות!' : 'סיימת לעבור על כל הדירות!'}
            </h3>
            <p className={`${themeConfig.accentColor} mb-6`}>
              {activeMode === 'scanned' 
                ? 'סרוק דירות חדשות או עבור למצב רגיל'
                : 'לחץ על כפתור האיפוס כדי להתחיל מהתחלה'
              }
            </p>
            <Button
              onClick={handleReset}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              התחל מחדש
            </Button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${themeConfig.accentColor}`}>
                  {currentIndex + 1} / {currentApartments.length}
                </span>
                <div className="flex items-center gap-2">
                  {activeMode === 'scanned' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      דירות סרוקות
                    </span>
                  )}
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
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / currentApartments.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Card Stack */}
            <div className="relative h-[500px] mb-6">
              {/* Background cards for stack effect */}
              {currentApartments.slice(currentIndex + 1, currentIndex + 3).map((_, index) => (
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
                  <div className={`h-2 w-full rounded-t-lg ${getStatusColor(currentApartment.status || 'not_spoke')}`} />
                  
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

                    {/* Scanned indicator */}
                    {activeMode === 'scanned' && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Yad2
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
                      {activeMode === 'scanned' && currentApartment.apartment_link && (
                        <a 
                          href={currentApartment.apartment_link} 
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

            {/* Action Buttons */}
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
              {activeMode === 'scanned' ? (
                <p className="text-xs text-blue-600 mt-1">
                  ❤️ לייק יוסיף את הדירה למאגר הרגיל
                </p>
              ) : (
                <p className="text-xs text-blue-600 mt-1">
                  מצב צפייה בלבד - הדירוגים לא נשמרים
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TinderMode;
