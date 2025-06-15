
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeHeaderProps {
  onDrawingGameOpen: () => void;
  onCatGameOpen: () => void;
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({ onDrawingGameOpen, onCatGameOpen }) => {
  const { themeConfig, cycleTheme } = useTheme();

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <button
          onClick={cycleTheme}
          className="text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="לחץ לשינוי ערכת נושא"
        >
          {themeConfig.mainEmoji}
        </button>
        <h1 className={`text-4xl font-bold ${themeConfig.textColor}`}>
          {themeConfig.title}
        </h1>
      </div>
      <p className={`${themeConfig.accentColor} text-lg mb-2`}>{themeConfig.subtitle}</p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <Button
          onClick={onDrawingGameOpen}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-2xl p-3 rounded-full animate-pulse"
          title="משחק ציור שיתופי!"
        >
          🎨
        </Button>
        <p className={`text-sm ${themeConfig.accentColor}`}>
          {themeConfig.punishment}
        </p>
        <Button
          onClick={onCatGameOpen}
          className={`${themeConfig.headerGradient} text-white text-2xl p-3 rounded-full animate-bounce`}
          title="תפוס את החתול!"
        >
          🐱
        </Button>
      </div>
    </div>
  );
};

export default ThemeHeader;
