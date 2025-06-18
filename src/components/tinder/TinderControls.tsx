
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface TinderControlsProps {
  onLike: () => void;
  onDislike: () => void;
  mode: 'regular' | 'scanned';
}

const TinderControls: React.FC<TinderControlsProps> = ({ onLike, onDislike, mode }) => {
  return (
    <>
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <Button
          onClick={onLike}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-green-500 text-green-500 hover:bg-green-50"
        >
          <Heart className="w-8 h-8" />
        </Button>
        
        <Button
          onClick={onDislike}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-50"
        >
          <X className="w-8 h-8" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          🤏 גרור ימינה לחיבה, שמאלה לדחייה
        </p>
        {mode === 'scanned' ? (
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
  );
};

export default TinderControls;
