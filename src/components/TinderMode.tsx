
import React, { useState, useRef, useEffect } from 'react';
import type { Apartment } from '@/types/ApartmentTypes';
import TinderCard from '@/components/tinder/TinderCard';
import TinderControls from '@/components/tinder/TinderControls';
import TinderProgressBar from '@/components/tinder/TinderProgressBar';
import TinderCompletionView from '@/components/tinder/TinderCompletionView';

interface TinderModeProps {
  apartments: Apartment[];
  scannedApartments?: any[];
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  onLikeScanned?: (apartment: any) => void;
  isAuthenticated: boolean;
  mode?: 'regular' | 'scanned';
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
  const startX = useRef(0);

  // Use scanned apartments when in scanned mode
  const currentApartments = mode === 'scanned' ? scannedApartments : apartments;
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
      <TinderCompletionView 
        mode={mode}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Bar */}
      <TinderProgressBar
        currentIndex={currentIndex}
        totalItems={currentApartments.length}
        onReset={handleReset}
        mode={mode}
      />

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
              height: '500px'
            }}
          />
        ))}

        <TinderCard
          apartment={currentApartment}
          mode={mode}
          dragOffset={dragOffset}
          swipeDirection={swipeDirection}
          onMouseStart={handleMouseStart}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <TinderControls
        onLike={handleLike}
        onDislike={handleDislike}
        mode={mode}
      />
    </div>
  );
};

export default TinderMode;
