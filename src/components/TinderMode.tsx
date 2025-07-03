
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw } from 'lucide-react';
import type { Apartment } from '@/types/ApartmentTypes';
import { useTheme } from '@/contexts/ThemeContext';
import TinderCard from '@/components/tinder/TinderCard';

interface TinderModeProps {
  apartments: Apartment[];
  scannedApartments?: any[];
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  onLikeScanned?: (apartment: any) => void;
  onDeleteScanned?: (apartmentId: string) => void;
  isAuthenticated: boolean;
  mode?: 'regular' | 'scanned';
}

const TinderMode: React.FC<TinderModeProps> = ({
  apartments,
  scannedApartments = [],
  onMorRatingChange,
  onGabiRatingChange,
  onLikeScanned,
  onDeleteScanned,
  isAuthenticated,
  mode = 'regular'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const { themeConfig } = useTheme();

  // Use scanned apartments when in scanned mode
  const currentApartments = mode === 'scanned' ? scannedApartments : apartments;
  const currentApartment = currentApartments[currentIndex];

  console.log('TinderMode - mode:', mode, 'currentApartments:', currentApartments.length, 'scannedApartments:', scannedApartments.length);

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
    if (mode === 'scanned' && onLikeScanned && currentApartment) {
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

  const handleDelete = (apartmentId: string) => {
    if (mode === 'scanned' && onDeleteScanned) {
      onDeleteScanned(apartmentId);
      // If we deleted the current apartment, stay on the same index (which will show the next apartment)
      // If we deleted the last apartment, go back one
      if (currentIndex >= currentApartments.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const nextCard = () => {
    if (currentIndex < currentApartments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
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
          {mode === 'scanned' ? 'סיימת לעבור על כל הדירות בסל המחזור!' : 'סיימת לעבור על כל הדירות!'}
        </h3>
        <p className={`${themeConfig.accentColor} mb-6`}>
          {mode === 'scanned' 
            ? 'סרוק דירות חדשות או חזור למצב רגיל'
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
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / currentApartments.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 mr-3">
          {currentIndex + 1} / {currentApartments.length}
        </span>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          איפוס
        </Button>
      </div>

      {/* Card Stack */}
      <div className="relative">
        {/* Background cards for stack effect */}
        {currentApartments.slice(currentIndex + 1, currentIndex + 3).map((_, index) => (
          <div
            key={`bg-${currentIndex + index + 1}`}
            className="absolute inset-0 bg-white/60 border-purple-200 rounded-lg"
            style={{
              transform: `scale(${0.95 - index * 0.05}) translateY(${(index + 1) * 8}px)`,
              zIndex: 1 + index,
            }}
          />
        ))}

        {/* Main Card */}
        <TinderCard
          apartment={currentApartment}
          mode={mode}
          dragOffset={dragOffset}
          swipeDirection={swipeDirection}
          onMouseStart={handleMouseStart}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDelete={mode === 'scanned' ? handleDelete : undefined}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleDislike}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 bg-red-50 border-red-200 hover:bg-red-100"
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>
        
        <Button
          onClick={handleLike}
          variant="outline" 
          size="lg"
          className="rounded-full w-16 h-16 bg-green-50 border-green-200 hover:bg-green-100"
          disabled={mode === 'scanned' && !isAuthenticated}
        >
          <Heart className="w-8 h-8 text-green-500" />
        </Button>
      </div>

      {mode === 'scanned' && !isAuthenticated && (
        <p className="text-center text-sm text-gray-500 mt-2">
          נדרשת התחברות כדי להוסיף דירות לרשימה
        </p>
      )}
    </div>
  );
};

export default TinderMode;
