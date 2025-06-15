
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const MusicalKeyboard: React.FC = () => {
  const { themeConfig } = useTheme();

  // סדר הפוך: דו הגבוה עד דו הנמוך
  const notes = [
    { name: 'דו', frequency: 523.25, emoji: '🎹' },
    { name: 'סי', frequency: 493.88, emoji: '🎺' },
    { name: 'לה', frequency: 440.00, emoji: '🎸' },
    { name: 'סו', frequency: 392.00, emoji: '🎧' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'דו', frequency: 261.63, emoji: '🎵' }
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
      // Volume מוגבר (בערך פי 4)
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      <div className="flex flex-wrap justify-center gap-1">
        {notes.map((note, index) => (
          <Button
            key={index}
            onClick={() => playNote(note.frequency)}
            className={`${themeConfig.buttonGradient} text-white text-base px-2 py-1 rounded-full min-w-8 min-h-8 transition-all duration-200 hover:scale-110 active:scale-95`}
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
