
import React, { useEffect, useRef } from 'react';
import { ThemeType } from '@/contexts/ThemeContext';

// URLs לצלילים שעובדים - משתמשים בצלילים חופשיים מהאינטרנט
const THEME_MUSIC: Record<ThemeType, string> = {
  cats: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  modern: 'https://www.soundjay.com/misc/sounds/beep-10.wav',
  capybara: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
  dogs: 'https://www.soundjay.com/misc/sounds/beep-03.wav',
  space: 'https://www.soundjay.com/misc/sounds/beep-09.wav'
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
    try {
      const audio = new Audio(THEME_MUSIC[currentTheme]);
      audio.loop = true;
      audio.volume = 0.2; // Keep volume low for background music
      audio.crossOrigin = "anonymous"; // הוספה לטיפול ב-CORS
      audioRef.current = audio;

      // Add event listeners
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', (e) => {
        console.log('Audio error:', e);
        setIsPlaying(false);
      });

      // Preload the audio
      audio.preload = 'metadata';
    } catch (error) {
      console.log('Error creating audio:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [currentTheme]);

  const toggleMusic = async () => {
    if (audioRef.current) {
      try {
        if (audioRef.current.paused) {
          // חשוב: דפדפנים דורשים interaction של המשתמש לפני השמעת אודיו
          await audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } catch (error) {
        console.log('Play failed:', error);
        // אם השמעה נכשלה, ננסה ליצור צליל פשוט כ-fallback
        try {
          // יצירת צליל קצר באמצעות Web Audio API
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // תדרים שונים לכל ערכת נושא
          const frequencies = {
            cats: 523.25, // C5
            modern: 440, // A4
            capybara: 349.23, // F4
            dogs: 293.66, // D4
            space: 659.25 // E5
          };
          
          oscillator.frequency.setValueAtTime(frequencies[currentTheme], audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), 500);
        } catch (fallbackError) {
          console.log('Fallback audio also failed:', fallbackError);
          // אם גם זה לא עובד, לפחות נציג feedback חזותי
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), 200);
        }
      }
    }
  };

  return { toggleMusic, isPlaying };
};
