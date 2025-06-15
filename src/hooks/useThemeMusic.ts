
import { useEffect, useRef } from 'react';
import { ThemeType } from '@/contexts/ThemeContext';

// Audio URLs for each theme (using royalty-free music from freesound.org or similar)
const THEME_MUSIC: Record<ThemeType, string> = {
  cats: 'https://www.soundjay.com/misc/sounds/cat-purr-1.mp3', // Cat purring/relaxing sounds
  modern: 'https://www.soundjay.com/electronic/sounds/house-1.mp3', // Modern electronic music
  capybara: 'https://www.soundjay.com/nature/sounds/forest-1.mp3', // Peaceful nature sounds
  dogs: 'https://www.soundjay.com/misc/sounds/happy-1.mp3', // Upbeat playful music
  space: 'https://www.soundjay.com/electronic/sounds/space-1.mp3' // Ambient space music
};

export const useThemeMusic = (currentTheme: ThemeType) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentThemeRef = useRef<ThemeType>(currentTheme);

  useEffect(() => {
    // Stop current music if theme changed
    if (currentThemeRef.current !== currentTheme && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    currentThemeRef.current = currentTheme;

    // Create new audio instance for current theme
    const audio = new Audio(THEME_MUSIC[currentTheme]);
    audio.loop = true;
    audio.volume = 0.3; // Keep volume low for background music
    audioRef.current = audio;

    // Start playing after a short delay
    const timer = setTimeout(() => {
      audio.play().catch(error => {
        console.log('Auto-play prevented:', error);
        // Auto-play is often blocked by browsers, user needs to interact first
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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

  const isPlaying = audioRef.current ? !audioRef.current.paused : false;

  return { toggleMusic, isPlaying };
};
