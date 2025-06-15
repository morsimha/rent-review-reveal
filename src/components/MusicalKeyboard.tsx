import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface MusicalKeyboardProps {
  bigButtons?: boolean;
}

const MusicalKeyboard: React.FC<MusicalKeyboardProps> = ({ bigButtons = false }) => {
  const { themeConfig } = useTheme();

  // סדר: התו הכי נמוך משמאל, הכי גבוה מימין (כולל 2 תווים גבוהים נוספים)
  const notes = [
    { name: 'דו', frequency: 261.63, emoji: '🎵' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'סול', frequency: 392.00, emoji: '🎧' },
    { name: 'לה', frequency: 440.00, emoji: '🎷' },
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
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        audioContext.close();
      }, 600);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  const buttonSizeClasses = bigButtons
    ? "text-2xl px-4 py-2 min-w-12 min-h-12"
    : "text-base px-2 py-1 min-w-8 min-h-8";

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-wrap justify-center gap-1">
        {notes.map((note, idx) => (
          <Button
            key={idx}
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
