
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface MusicalKeyboardProps {
  bigButtons?: boolean;
}

const MusicalKeyboard: React.FC<MusicalKeyboardProps> = ({ bigButtons = false }) => {
  const { themeConfig } = useTheme();

  // סדר: דו הנמוך עד דו הגבוה (משמאל לימין)
  const notes = [
    { name: 'דו', frequency: 261.63, emoji: '🎵' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'סול', frequency: 392.00, emoji: '🎧' },
  ];

  const playNote = (frequency: number) => {
    try {
      // יצירת AudioContext חדש בכל לחיצה כדי למנוע תקיעות
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // התחלה עם ווליום מלא וירידה הדרגתית
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // ניקוי ה-AudioContext אחרי שהצליל הסתיים
      setTimeout(() => {
        audioContext.close();
      }, 600);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  // גודל כפתורים דינמי לפי props
  const buttonSizeClasses = bigButtons
    ? "text-2xl px-4 py-2 min-w-12 min-h-12"
    : "text-base px-2 py-1 min-w-8 min-h-8";

  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      <div className="flex flex-wrap justify-center gap-1">
        {notes.map((note, index) => (
          <Button
            key={index}
            onClick={() => playNote(note.frequency)}
            className={`${themeConfig.buttonGradient} text-white ${buttonSizeClasses} rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
            title={`נגן ${note.name}`}
          >
            {note.emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MusicalKeyboard;
