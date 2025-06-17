import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import MusicalKeyboard from '@/components/MusicalKeyboard';
import AdvancedPiano from '@/components/AdvancedPiano';
import VoiceRecorder from '@/components/VoiceRecorder';
import ApartmentDesigner from '@/components/ApartmentDesigner';
import { Sparkles, Mic } from 'lucide-react';

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
      <style>{`
        @keyframes hop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-hop {
          animation: hop 1.2s ease-in-out infinite;
        }

        @keyframes spin-glow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .animate-spin-glow {
          animation: spin-glow 3s ease-in-out infinite;
        }

        @keyframes subtle-flash {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-subtle-flash {
          animation: subtle-flash 2.5s ease-in-out infinite;
        }

        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="relative group">
          <button
            onClick={() => setIsPianoOpen(true)}
            className="relative text-4xl hover:scale-110 transition-all duration-300 cursor-pointer p-2 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 shadow-lg hover:shadow-xl border-2 border-blue-200 hover:border-blue-300"
            title="פסנתר אינטראקטיבי!"
          >
            <span className="relative z-10">🎹</span>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl animate-bounce-soft" />
          </button>
        </div>

        <div className="relative group">
          <button
            onClick={() => setIsDesignerOpen(true)}
            className="relative text-4xl hover:scale-110 transition-all duration-300 cursor-pointer p-2 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 shadow-lg hover:shadow-xl border-2 border-purple-200 hover:border-purple-300"
            title="מעצב דירות AI - הפוך כל חלל למושלם!"
          >
            <span className="relative z-10">🖼️</span>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl animate-subtle-flash" />
          </button>
        </div>

        <div className="relative group">
          <button
            onClick={onDrawingGameOpen}
            className="relative text-4xl hover:scale-110 transition-all duration-300 cursor-pointer p-2 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 shadow-lg hover:shadow-xl border-2 border-yellow-200 hover:border-yellow-300"
            title="משחק ציור שיתופי!"
          >
            <span className="relative z-10">🎨</span>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl animate-spin-glow" />
          </button>
        </div>

        <div className="relative group">
          <button
            onClick={onCatGameOpen}
            className="relative text-4xl hover:scale-110 transition-all duration-300 cursor-pointer p-2 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 shadow-lg hover:shadow-xl border-2 border-pink-200 hover:border-pink-300"
            title="תפוס את החתול!"
          >
            <span className="relative z-10">🐱</span>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-2xl animate-hop" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeHeader;
