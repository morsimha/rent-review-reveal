import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MusicalKeyboardProps {
  bigButtons?: boolean;
}

const MusicalKeyboard: React.FC<MusicalKeyboardProps> = ({ bigButtons = false }) => {
  const { themeConfig } = useTheme();
  const isMobile = useIsMobile();
  const [volume, setVolume] = useState(0.8);

  const handleVolumeUp = () => setVolume(v => Math.min(1, v + 0.1));
  const handleVolumeDown = () => setVolume(v => Math.max(0, v - 0.1));

  // סדר: דו הגבוה עד דו הנמוך (כולל 2 תווים גבוהים נוספים)
  const notes = [
    { name: 'דו', frequency: 261.63, emoji: '🎵' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'סול', frequency: 392.0, emoji: '🎧' },
    { name: 'לה', frequency: 440.0, emoji: '🎷' },
    { name: 'סי', frequency: 493.88, emoji: '🎻' },
    { name: 'דו גבוה', frequency: 523.25, emoji: '🎺' },
  ];

  const playNote = (frequency: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // צליל ארוך יותר ועוצמתי יותר
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.2);
      
      setTimeout(() => {
        audioContext.close();
      }, 1300);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  // responsive button sizes with modern circular design
  const getButtonClasses = () => {
    if (isMobile) {
      return bigButtons 
        ? "text-xl px-3 py-3 min-w-12 min-h-12 text-sm" 
        : "text-base px-2 py-2 min-w-10 min-h-10 text-xs";
    }
    return bigButtons
      ? "text-2xl px-4 py-4 min-w-14 min-h-14"
      : "text-base px-3 py-3 min-w-10 min-h-10";
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-6 w-full overflow-x-auto">
      {/* Volume controls */}
      <div className="flex flex-row items-center gap-2 mb-2">
        <Button onClick={handleVolumeDown} size="sm" className={`${themeConfig.buttonGradient} rounded-full shadow-md hover:scale-110 transition-all duration-200 w-9 h-9 flex items-center justify-center text-lg`}>-</Button>
        <span className="text-sm">עוצמה: {(volume * 100).toFixed(0)}%</span>
        <Button onClick={handleVolumeUp} size="sm" className={`${themeConfig.buttonGradient} rounded-full shadow-md hover:scale-110 transition-all duration-200 w-9 h-9 flex items-center justify-center text-lg`}>+</Button>
      </div>
      <div className="flex items-center justify-center gap-2 mb-6 w-full overflow-x-auto">
        <div className={`flex ${isMobile ? 'flex-wrap' : 'flex-row'} justify-center gap-2 ${isMobile ? 'max-w-sm mx-auto' : ''}`}>
          {notes.map((note, idx) => (
            <Button
              key={idx}
              onClick={() => playNote(note.frequency)}
              className={`${themeConfig.buttonGradient} text-white ${getButtonClasses()} rounded-full transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
              title={`נגן ${note.name}`}
            >
              <div className="flex flex-col items-center">
                <span className={isMobile ? (bigButtons ? "text-lg" : "text-base") : (bigButtons ? "text-xl" : "text-lg")}>{note.emoji}</span>
                {bigButtons && (
                  <span className={isMobile ? "text-xs font-semibold" : "text-sm font-semibold"}>{note.name}</span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicalKeyboard;
