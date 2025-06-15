
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useTheme } from '@/contexts/ThemeContext';
import MusicalKeyboard from '@/components/MusicalKeyboard';

interface ThemeHeaderProps {
  onDrawingGameOpen: () => void;
  onCatGameOpen: () => void;
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({ onDrawingGameOpen, onCatGameOpen }) => {
  const { themeConfig, cycleTheme } = useTheme();
  const [isPianoOpen, setIsPianoOpen] = useState(false);

  return (
    <div className="text-center mb-8">
      {/* Drawer לפסנתר */}
      <Drawer open={isPianoOpen} onOpenChange={setIsPianoOpen}>
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
          {/* Cute Piano Button */}
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-3xl p-0 w-12 h-12 rounded-full flex items-center justify-center transition-transform"
              style={{ fontSize: '2rem', lineHeight: '1' }}
              title="פסנתר חמוד!"
            >
              <span role="img" aria-label="Piano">🎹</span>
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              פסנתר אינטראקטיבי
              <span className="mx-2" role="img" aria-label="Piano">🎹</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex items-center justify-center mt-2">
            <MusicalKeyboard bigButtons />
          </div>
        </DrawerContent>
      </Drawer>
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
