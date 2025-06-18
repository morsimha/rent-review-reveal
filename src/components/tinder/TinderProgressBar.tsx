
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface TinderProgressBarProps {
  currentIndex: number;
  totalItems: number;
  onReset: () => void;
  mode: 'regular' | 'scanned';
}

const TinderProgressBar: React.FC<TinderProgressBarProps> = ({
  currentIndex,
  totalItems,
  onReset,
  mode
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-purple-600">
          {currentIndex + 1} / {totalItems}
        </span>
        <div className="flex items-center gap-2">
          {mode === 'scanned' && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              דירות סרוקות
            </span>
          )}
          <Button
            onClick={onReset}
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
          style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TinderProgressBar;
