
import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_STORAGE_KEY = "lovable_theme";
export type ThemeId = "cats" | "modern" | "capybara" | "dogs" | "space";
export interface Theme {
  id: ThemeId;
  name: string;
  background: string; // Tailwind classes for gradient/bg
  emojis: string[];
  className: string; // classes for title or decorations
}

const THEMES: Theme[] = [
  {
    id: "cats",
    name: "חתולים",
    background: "from-yellow-100 via-orange-100 to-pink-100",
    emojis: ["🐱", "😸", "🐈", "😻", "🐾", "🙀", "😺"],
    className: "text-yellow-700 bg-yellow-50",
  },
  {
    id: "modern",
    name: "בתים מודרניים",
    background: "from-gray-100 via-blue-100 to-gray-300",
    emojis: ["🏠", "🏡", "🏢", "🏬", "🏘️", "🏙️"],
    className: "text-blue-800 bg-blue-50",
  },
  {
    id: "capybara",
    name: "קפיברה",
    background: "from-lime-100 via-amber-100 to-amber-200",
    emojis: ["🦫", "🦦", "🦦", "🦫", "🥔", "🌿"],
    className: "text-amber-800 bg-amber-50",
  },
  {
    id: "dogs",
    name: "כלבים",
    background: "from-amber-100 via-yellow-200 to-orange-200",
    emojis: ["🐶", "🐕", "🦴", "🐾", "🐩", "🦮"],
    className: "text-orange-700 bg-orange-50",
  },
  {
    id: "space",
    name: "חלל/כוכבים",
    background: "from-indigo-900 via-blue-800 to-purple-900",
    emojis: ["🌟", "🌌", "🚀", "🛸", "🪐"],
    className: "text-indigo-200 bg-indigo-900",
  },
];

interface ThemeContextProps {
  theme: Theme;
  setThemeById: (id: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeId, setThemeId] = useState<ThemeId>("cats");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && THEMES.some(t => t.id === stored)) setThemeId(stored as ThemeId);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const setThemeById = (id: ThemeId) => setThemeId(id);
  const cycleTheme = () => {
    const idx = THEMES.findIndex(t => t.id === themeId);
    const next = THEMES[(idx + 1) % THEMES.length];
    setThemeId(next.id);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES.find(t => t.id === themeId)!, setThemeById, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemeDetails() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeContext not found");
  return ctx;
}
