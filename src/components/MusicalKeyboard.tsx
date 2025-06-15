
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const MusicalKeyboard: React.FC = () => {
  const { themeConfig } = useTheme();

  const notes = [
    { name: 'דו', frequency: 261.63, emoji: '🎵' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'סו', frequency: 392.00, emoji: '🎧' },
    { name: 'לה', frequency: 440.00, emoji: '🎸' },
    { name: 'סי', frequency: 493.88, emoji: '🎺' },
    { name: 'דו', frequency: 523.25, emoji: '🎹' }
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
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
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
            className={`${themeConfig.buttonGradient} text-white text-lg px-3 py-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
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
