import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface MusicalKeyboardPopupProps {
  bigButtons?: boolean;
  onClose: () => void;
}

const MusicalKeyboardPopup: React.FC<MusicalKeyboardPopupProps> = ({
  bigButtons = false,
  onClose,
}) => {
  const { themeConfig } = useTheme();

  // התו הכי נמוך משמאל ועד הכי גבוה מימין, כולל שני תווים נוספים
  const notes = [
    { name: 'דו', frequency: 261.63, emoji: '🎵' },
    { name: 'רה', frequency: 293.66, emoji: '🎶' },
    { name: 'מי', frequency: 329.63, emoji: '🎼' },
    { name: 'פה', frequency: 349.23, emoji: '🎤' },
    { name: 'סול', frequency: 392.0, emoji: '🎧' },
    { name: 'לה', frequency: 440.0, emoji: '🎷' },
    { name: 'סי', frequency: 493.88, emoji: '🎻' },
  ];

  const playNote = (frequency: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      osc.start();
      osc.stop(audioContext.currentTime + 0.5);

      setTimeout(() => audioContext.close(), 600);
    } catch (e) {
      console.error('Failed to play note:', e);
    }
  };

  const buttonSizeClasses = bigButtons
    ? 'text-2xl px-4 py-2 min-w-12 min-h-12'
    : 'text-base px-2 py-1 min-w-8 min-h-8';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* רקע חצי־שקוף */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* קופסה מרכזית */}
      <div
        className="
          relative
          bg-white dark:bg-gray-800
          p-6
          rounded-xl
          shadow-xl
          flex flex-col items-center
          w-[90vw] max-w-[800px]  /* רוחב גדול, עד 800px */
          h-[33vh]               /* גובה כ-⅓ מהגלישה */
        "
      >
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3
            text-gray-500 hover:text-gray-700
            dark:hover:text-gray-300
          "
        >
          ✕
        </button>

        {/* המקלדת */}
        <div className="flex flex-wrap justify-center gap-2">
          {notes.map((note, idx) => (
            <Button
              key={idx}
              onClick={() => playNote(note.frequency)}
              className={`
                ${themeConfig.buttonGradient}
                text-white
                ${buttonSizeClasses}
                rounded-full
                transition-transform duration-200
                hover:scale-110 active:scale-95
              `}
              title={`נגן ${note.name}`}
            >
              {note.emoji}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicalKeyboardPopup;
