
import React, { useEffect, useRef } from 'react';
import { ThemeType } from '@/contexts/ThemeContext';

// Audio URLs for each theme (using working public URLs)
const THEME_MUSIC: Record<ThemeType, string> = {
  cats: 'https://www.soundjay.com/misc/sounds/beep-07a.wav', // Short cat-like sound
  modern: 'https://www.soundjay.com/misc/sounds/beep-10.wav', // Electronic beep
  capybara: 'https://www.soundjay.com/misc/sounds/beep-05.wav', // Soft nature-like sound
  dogs: 'https://www.soundjay.com/misc/sounds/beep-03.wav', // Playful sound
  space: 'https://www.soundjay.com/misc/sounds/beep-09.wav' // Futuristic beep
};

export const useThemeMusic = (currentTheme: ThemeType) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentThemeRef = useRef<ThemeType>(currentTheme);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    // Stop current music if theme changed
    if (currentThemeRef.current !== currentTheme && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    currentThemeRef.current = currentTheme;

    // Create new audio instance for current theme
    const audio = new Audio(THEME_MUSIC[currentTheme]);
    audio.loop = true;
    audio.volume = 0.3; // Keep volume low for background music
    audioRef.current = audio;

    // Add event listeners
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [currentTheme]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(error => {
          console.log('Play failed:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  return { toggleMusic, isPlaying };
};
