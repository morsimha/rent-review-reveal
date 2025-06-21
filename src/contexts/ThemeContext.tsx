
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeType = 'cats' | 'modern' | 'capybara' | 'dogs' | 'space';

interface ThemeConfig {
  name: string;
  title: string;
  subtitle: string;
  punishment: string;
  mapTitle: string;
  backgroundGradient: string;
  buttonGradient: string;
  headerGradient: string;
  textColor: string;
  accentColor: string;
  backgroundEmojis: string[];
  mainEmoji: string;
  sortEmojis: {
    rating: string;
    entry_date: string;
    created_at: string;
    status: string;
  };
}

const themeConfigs: Record<ThemeType, ThemeConfig> = {
  cats: {
    name: 'חתולים',
    title: 'Rent Master',
    subtitle: 'וואו איזה ביתתת 🏠✨',
    punishment: 'מי שמוסיף הכי פחות דירות עושה כלים לשבוע בבית החדש',
    mapTitle: 'מפת הדירות',
    backgroundGradient: 'bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100',
    buttonGradient: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    headerGradient: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600',
    textColor: 'text-purple-800',
    accentColor: 'text-purple-600',
    backgroundEmojis: ['🐱', '😸', '🐈', '😻', '🐾', '🙀', '😺'],
    mainEmoji: '🏠',
    sortEmojis: {
      rating: '🏅',
      entry_date: '🗓️',
      created_at: '⏰',
      status: '📞'
    }
  },
  modern: {
    name: 'מודרני',
    title: 'מור וגבי במסע לבית החלומות',
    subtitle: 'ארכיטקטורה מודרנית ועיצוב עכשווי 🏢✨',
    punishment: 'מי שמוסיף הכי פחות דירות מנקה את הפנטהאוז החדש',
    mapTitle: 'מפת הנכסים המודרניים',
    backgroundGradient: 'bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100',
    buttonGradient: 'bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800',
    headerGradient: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    textColor: 'text-slate-800',
    accentColor: 'text-slate-600',
    backgroundEmojis: ['🏢', '🏙️', '🌆', '🏗️', '🏘️', '🏛️', '🏬'],
    mainEmoji: '🏢',
    sortEmojis: {
      rating: '⭐',
      entry_date: '📅',
      created_at: '🕒',
      status: '📱'
    }
  },
  capybara: {
    name: 'קפיברה',
    title: 'מור וגבי רגועים כמו קפיברות',
    subtitle: 'חיפוש דירה בסגנון זן וטבעי 🌿☮️',
    punishment: 'מי שמוסיף הכי פחות דירות מכין תה צמחים לכולם',
    mapTitle: 'מפת הבריכות והדירות',
    backgroundGradient: 'bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100',
    buttonGradient: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    headerGradient: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600',
    textColor: 'text-green-800',
    accentColor: 'text-green-600',
    backgroundEmojis: ['🦫', '🌿', '💚', '🍃', '🌱', '🌊', '☘️'],
    mainEmoji: '🦫',
    sortEmojis: {
      rating: '🌟',
      entry_date: '🌅',
      created_at: '⏳',
      status: '🌊'
    }
  },
  dogs: {
    name: 'כלבים',
    title: 'מור וגבי מחפשים בית ללהקה',
    subtitle: 'כל דירה צריכה חצר לכלבים! 🐕🦴',
    punishment: 'מי שמוסיף הכי פחות דירות מטייל עם כל הכלבים בשכונה',
    mapTitle: 'מפת הדירות הידידותיות לכלבים',
    backgroundGradient: 'bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100',
    buttonGradient: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    headerGradient: 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600',
    textColor: 'text-amber-800',
    accentColor: 'text-amber-600',
    backgroundEmojis: ['🐕', '🐶', '🦴', '🐕‍🦺', '🎾', '🐾', '❤️'],
    mainEmoji: '🐕',
    sortEmojis: {
      rating: '🏆',
      entry_date: '📆',
      created_at: '⌚',
      status: '☎️'
    }
  },
  space: {
    name: 'חלל',
    title: 'מור וגבי מחפשים בית בין הכוכבים',
    subtitle: 'דירות מהעתיד עם נוף לגלקסיה 🚀🌌',
    punishment: 'מי שמוסיף הכי פחות דירות מנקה את החללית',
    mapTitle: 'מפת התחנות החלליות',
    backgroundGradient: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100',
    buttonGradient: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    headerGradient: 'bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600',
    textColor: 'text-indigo-800',
    accentColor: 'text-indigo-600',
    backgroundEmojis: ['🚀', '🌟', '🛸', '🌌', '⭐', '🌠', '👽'],
    mainEmoji: '🚀',
    sortEmojis: {
      rating: '🌟',
      entry_date: '🛰️',
      created_at: '⚡',
      status: '📡'
    }
  }
};

interface ThemeContextType {
  currentTheme: ThemeType;
  themeConfig: ThemeConfig;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('cats');
  
  const cycleTheme = () => {
    const themes: ThemeType[] = ['cats', 'modern', 'capybara', 'dogs', 'space'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const themeConfig = themeConfigs[currentTheme];

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
