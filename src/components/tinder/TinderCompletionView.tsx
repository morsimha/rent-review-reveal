
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface TinderCompletionViewProps {
  mode: 'regular' | 'scanned';
  onReset: () => void;
}

const TinderCompletionView: React.FC<TinderCompletionViewProps> = ({ mode, onReset }) => {
  const { themeConfig } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className={`text-2xl font-bold ${themeConfig.textColor} mb-4`}>
        {mode === 'scanned' ? 'סיימת לעבור על כל הדירות הסרוקות!' : 'סיימת לעבור על כל הדירות!'}
      </h3>
      <p className={`${themeConfig.accentColor} mb-6`}>
        {mode === 'scanned' 
          ? 'סרוק דירות חדשות או חזור למצב רגיל'
          : 'לחץ על כפתור האיפוס כדי להתחיל מהתחלה'
        }
      </p>
      <Button
        onClick={onReset}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        התחל מחדש
      </Button>
    </div>
  );
};

export default TinderCompletionView;
