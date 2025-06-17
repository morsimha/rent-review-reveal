
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import MusicalKeyboard from '@/components/MusicalKeyboard';
import AdvancedPiano from '@/components/AdvancedPiano';
import VoiceRecorder from '@/components/VoiceRecorder';
import ApartmentDesigner from '@/components/ApartmentDesigner';
import { Sparkles, Mic, Palette } from 'lucide-react';

interface ThemeHeaderProps {
  onDrawingGameOpen: () => void;
  onCatGameOpen: () => void;
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({ onDrawingGameOpen, onCatGameOpen }) => {
  const { themeConfig, cycleTheme } = useTheme();
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [isAdvancedPianoOpen, setIsAdvancedPianoOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [melodyAnalysis, setMelodyAnalysis] = useState<string>('');

  const openAdvancedPiano = () => {
    setIsPianoOpen(false);
    setTimeout(() => {
      setIsAdvancedPianoOpen(true);
    }, 100);
  };

  const openVoiceRecorder = () => {
    setIsPianoOpen(false);
    setTimeout(() => {
      setIsVoiceRecorderOpen(true);
    }, 100);
  };

  return (
    <div className="text-center mb-8">
      {/* Melody Analysis Display */}
      {melodyAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border-2 border-purple-200 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl mb-2">🎹</div>
            <h4 className="font-bold text-purple-800 mb-3 text-lg">ניתוח המנגינה</h4>
            <p className="text-purple-700 leading-relaxed text-right">
              {melodyAnalysis}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              {['🎵', '🎶', '🎼', '🎹', '🎸'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-lg animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <button
              onClick={() => setMelodyAnalysis('')}
              className="mt-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-2 px-4 rounded-full text-sm transform transition-all duration-200 hover:scale-105"
            >
              🔄 נקה תוצאה
            </button>
          </div>
        </div>
      )}

      {/* Dialog לפסנתר רגיל */}
      <Dialog open={isPianoOpen} onOpenChange={setIsPianoOpen}>
        <DialogContent className="max-w-fit bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              פסנתר אינטראקטיבי
              <span className="mx-2" role="img" aria-label="Piano">🎹</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <MusicalKeyboard bigButtons />
            
            <div className="flex gap-3">
              {/* כפתור לפסנתר מתקדם */}
              <Button
                onClick={openAdvancedPiano}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                סטודיו הקלטות AI
              </Button>
              
              {/* כפתור להקלטת קול */}
              <Button
                onClick={openVoiceRecorder}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Mic className="w-4 h-4 mr-2" />
                הקלט שירה 🎤
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog לפסנתר מתקדם - ממשק קומפקטי */}
      <Dialog open={isAdvancedPianoOpen} onOpenChange={setIsAdvancedPianoOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎹 סטודיו הקלטות AI 🎵
              <p className="text-xs font-normal text-gray-600 mt-1">
                נגן, הקלט, ותן ל-AI לזהות את המנגינה שלך!
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <AdvancedPiano onMelodyAnalysis={setMelodyAnalysis} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog להקלטת קול - ממשק קומפקטי */}
      <Dialog open={isVoiceRecorderOpen} onOpenChange={setIsVoiceRecorderOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🎤 מה קורה? בוא נשמע אותך! 🎵
            </DialogTitle>
          </DialogHeader>
          <VoiceRecorder />
        </DialogContent>
      </Dialog>

      {/* Dialog למעצב דירות */}
      <ApartmentDesigner isOpen={isDesignerOpen} onClose={() => setIsDesignerOpen(false)} />

      <div className="flex items-center justify-center gap-2 mb-4">
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
      
      <p className={`${themeConfig.accentColor} text-lg mb-4`}>{themeConfig.subtitle}</p>
      
      {/* Creative Tools Section */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {/* Main tools row */}
        <div className="flex items-center justify-center gap-4">
          {/* כפתור פסנתר */}
          <button
            onClick={() => setIsPianoOpen(true)}
            className="text-4xl hover:scale-110 transition-transform duration-300 cursor-pointer hover:drop-shadow-lg"
            title="פסנתר אינטראקטיבי!"
          >
            🎹
          </button>
          
          {/* כפתור מעצב דירות - עיצוב מיוחד */}
          <div className="relative group">
            <button
              onClick={() => setIsDesignerOpen(true)}
              className="relative text-4xl hover:scale-110 transition-all duration-300 cursor-pointer p-2 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 shadow-lg hover:shadow-xl border-2 border-purple-200 hover:border-purple-300"
              title="מעצב דירות AI - הפוך כל חלל למושלם!"
            >
              <span className="relative z-10">🖼️</span>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl animate-pulse"></div>
            </button>
            
            {/* תווית מעוררת עניין */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full animate-bounce font-bold shadow-lg">
              חדש!
            </div>
            
            {/* טקסט הסבר */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-lg border whitespace-nowrap z-20">
              🎨 מעצב דירות AI ✨
            </div>
          </div>
        </div>
        
        {/* Game buttons row */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={onDrawingGameOpen}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-2xl p-3 rounded-full animate-pulse shadow-lg transform transition-all duration-200 hover:scale-105"
            title="משחק ציור שיתופי!"
          >
            🎨
          </Button>
          
          <p className={`text-sm ${themeConfig.accentColor} mx-4`}>
            {themeConfig.punishment}
          </p>
          
          <Button
            onClick={onCatGameOpen}
            className={`${themeConfig.headerGradient} text-white text-2xl p-3 rounded-full animate-bounce shadow-lg transform transition-all duration-200 hover:scale-105`}
            title="תפוס את החתול!"
          >
            🐱
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeHeader;
