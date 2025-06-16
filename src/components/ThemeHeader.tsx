
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MusicalKeyboard from '@/components/MusicalKeyboard';
import AdvancedPiano from '@/components/AdvancedPiano';
import { Sparkles } from 'lucide-react';

interface ThemeHeaderProps {
  onDrawingGameOpen: () => void;
  onCatGameOpen: () => void;
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({ onDrawingGameOpen, onCatGameOpen }) => {
  const { themeConfig, cycleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [isAdvancedPianoOpen, setIsAdvancedPianoOpen] = useState(false);

  const openAdvancedPiano = () => {
    setIsPianoOpen(false);
    setTimeout(() => {
      setIsAdvancedPianoOpen(true);
    }, 100);
  };

  return (
    <div className="text-center mb-8">
      {/* Dialog לפסנתר רגיל */}
      <Dialog open={isPianoOpen} onOpenChange={setIsPianoOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-fit'}`}>
          <DialogHeader>
            <DialogTitle className={`text-center ${isMobile ? 'text-lg' : 'text-xl'}`}>
              פסנתר אינטראקטיבי
              <span className="mx-2" role="img" aria-label="Piano">🎹</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              פסנתר אינטראקטיבי לנגינה
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <MusicalKeyboard bigButtons />
            
            {/* כפתור לפסנתר מתקדם */}
            <Button
              onClick={openAdvancedPiano}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} rounded-full shadow-md transform transition-all duration-200 hover:scale-105`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI סטודיו הקלטות
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog לפסנתר מתקדם */}
      <Dialog open={isAdvancedPianoOpen} onOpenChange={setIsAdvancedPianoOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] overflow-y-auto p-3' : 'max-w-5xl max-h-[95vh] overflow-y-auto'}`}>
          <DialogHeader>
            <DialogTitle className={`text-center ${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
              🎹 סטודיו הקלטות AI עם זיהוי מנגינות 🎵
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-normal text-gray-600 mt-2`}>
                !נגן, הקלט, ותן לצ'אט לזהות את המנגינה שלך
              </p>
            </DialogTitle>
            <DialogDescription className="sr-only">
              סטודיו הקלטות מתקדם עם זיהוי מנגינות AI
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center mt-2">
            <AdvancedPiano />
          </div>
        </DialogContent>
      </Dialog>

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
        {/* כפתור פסנתר רגיל */}
        <button
          onClick={() => setIsPianoOpen(true)}
          className="text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="פסנתר חמוד!"
        >
          🎹
        </button>
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
