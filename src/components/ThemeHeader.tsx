
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
  const [melodyAnalysis, setMelodyAnalysis] = useState<string | null>(null);

  const openAdvancedPiano = () => {
    setIsPianoOpen(false);
    setMelodyAnalysis(null);
    setTimeout(() => {
      setIsAdvancedPianoOpen(true);
    }, 100);
  };

  const handleMelodyAnalysis = (analysis: string) => {
    setMelodyAnalysis(analysis);
  };

  return (
    <div className="text-center mb-8">
      {/* Dialog לפסנתר רגיל */}
      <Dialog open={isPianoOpen} onOpenChange={setIsPianoOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-2xl max-h-[90vh]'} overflow-y-auto rounded-2xl border-2 shadow-xl bg-gradient-to-br from-white to-blue-50`}>
          <DialogHeader>
            <DialogTitle className={`text-center ${isMobile ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              <Sparkles className="w-5 h-5 mr-2" />
              🎹 פסנתר אינטראקטיבי
            </DialogTitle>
            <DialogDescription className={`text-center ${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mt-2`}>
              נגן את המנגינות הישמיות שלך!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 p-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-inner">
              <MusicalKeyboard bigButtons />
            </div>
            
            {/* כפתור לפסנתר מתקדם */}
            <Button
              onClick={openAdvancedPiano}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${isMobile ? 'px-4 py-3 text-sm' : 'px-6 py-3 text-base'} rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              עם זיהוי מנגינות AI סטודיו הקלטות 🎵
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog לפסנתר מתקדם */}
      <Dialog open={isAdvancedPianoOpen} onOpenChange={setIsAdvancedPianoOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] p-3' : 'max-w-6xl max-h-[95vh] p-6'} overflow-y-auto rounded-2xl border-2 shadow-2xl bg-gradient-to-br from-white via-purple-50 to-pink-50`}>
          <DialogHeader>
            <DialogTitle className={`text-center ${isMobile ? 'text-lg' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent`}>
            <Sparkles className="w-5 h-5 mr-2" />
            עם זיהוי מנגינותAI סטודיו הקלטות 🎵
            </DialogTitle>
            <DialogDescription className={`text-center ${isMobile ? 'text-xs' : 'text-base'} text-gray-600 mt-2 font-medium`}>
              !נגן, הקלט, ותן לצ'אטי לזהות את המנגינה שלך
            </DialogDescription>
          </DialogHeader>
          
          {/* תוצאת ניתוח המנגינה */}
          {melodyAnalysis && (
            <div className={`mx-auto ${isMobile ? 'max-w-xs' : 'max-w-2xl'} mb-4`}>
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 shadow-lg border-2 border-green-200">
                <h3 className={`font-bold text-green-800 mb-2 ${isMobile ? 'text-sm' : 'text-lg'} text-center`}>
                  🎼 ניתוח המנגינה 🎼
                </h3>
                <p className={`text-green-700 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed text-center`}>
                  {melodyAnalysis}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center mt-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-inner w-full">
              <AdvancedPiano onMelodyAnalysis={handleMelodyAnalysis} />
            </div>
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
