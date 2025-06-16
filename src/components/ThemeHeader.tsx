import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import MusicalKeyboard from '@/components/MusicalKeyboard';
import AdvancedPiano from '@/components/AdvancedPiano';
import { Music } from 'lucide-react';

interface ThemeHeaderProps {
  onDrawingGameOpen: () => void;
  onCatGameOpen: () => void;
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({ onDrawingGameOpen, onCatGameOpen }) => {
  const { themeConfig, cycleTheme } = useTheme();
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [isAdvancedPianoOpen, setIsAdvancedPianoOpen] = useState(false);

  return (
    <div className="text-center mb-8">
      {/* Dialog לפסנתר רגיל */}
      <Dialog open={isPianoOpen} onOpenChange={setIsPianoOpen}>
        <DialogContent className="max-w-fit">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              פסנתר אינטראקטיבי
              <span className="mx-2" role="img" aria-label="Piano">🎹</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center mt-4">
            <MusicalKeyboard bigButtons />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog לפסנתר מתקדם */}
      <Dialog open={isAdvancedPianoOpen} onOpenChange={setIsAdvancedPianoOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              🎹 סטודיו הקלטות עם זיהוי מנגינות AI 🎵
              <p className="text-sm font-normal text-gray-600 mt-2">
                נגן, הקלט, ותן ל-AI לזהות את המנגינה שלך!
              </p>
            </DialogTitle>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPianoOpen(true)}
          className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-3xl p-0 w-12 h-12 rounded-full flex items-center justify-center transition-transform"
          style={{ fontSize: '2rem', lineHeight: '1' }}
          title="פסנתר חמוד!"
        >
          <span role="img" aria-label="Piano">🎹</span>
        </Button>
      </div>
      
      <p className={`${themeConfig.accentColor} text-lg mb-2`}>{themeConfig.subtitle}</p>
      
      {/* שורת הכפתורים המיוחדים */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* כפתור ציור */}
        <Button
          onClick={onDrawingGameOpen}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-2xl p-3 rounded-full animate-pulse"
          title="משחק ציור שיתופי!"
        >
          🎨
        </Button>

        {/* כפתור פסנתר מתקדם - חדש! */}
        <Button
          onClick={() => setIsAdvancedPianoOpen(true)}
          className="relative group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
          title="סטודיו הקלטות AI!"
        >
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            <span className="text-sm font-bold">סטודיו AI</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </div>
        </Button>

        {/* טקסט העונש */}
        <p className={`text-sm ${themeConfig.accentColor} max-w-xs`}>
          {themeConfig.punishment}
        </p>

        {/* כפתור חתולים */}
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