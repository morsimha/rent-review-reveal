
import { useState, useCallback } from "react";
import type { Apartment } from "@/types/ApartmentTypes";

export function useApartmentAdviceDialog(apartment: Apartment) {
  const [open, setOpen] = useState(false);

  // Advice state
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Joke state
  const [joke, setJoke] = useState<string | null>(null);
  const [jokeError, setJokeError] = useState<string | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setAdviceError(null);
    setAdvice(null);
    setAdviceLoading(true);
    try {
      const res = await fetch(
        "https://afcdqglyehygiareaoot.supabase.co/functions/v1/gpt-apartment-advisor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2RxZ2x5ZWh5Z2lhcmVhb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQyNjgsImV4cCI6MjA2NTQ5MDI2OH0.F2Ljk7v3WkXnuAZ2Vt4VUQKEuP_ZWTeTt7rVTTFGTI8"}`
          },
          body: JSON.stringify({ apartment }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setAdviceError(`שגיאה: ${errorData.error || res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data.advice) {
        setAdvice(data.advice);
      } else {
        setAdviceError("לא התקבלה תשובה מהמערכת. נסה שוב מאוחר יותר.");
      }
    } catch (e: any) {
      setAdviceError("שגיאה בחיבור ל-GPT. נסה שוב בעוד רגע.");
    } finally {
      setAdviceLoading(false);
    }
  }, [apartment]);

  const fetchJoke = useCallback(async () => {
    setJokeError(null);
    setJoke(null);
    setJokeLoading(true);
    try {
      const res = await fetch(
        "https://afcdqglyehygiareaoot.supabase.co/functions/v1/gpt-apartment-advisor-joke",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2RxZ2x5ZWh5Z2lhcmVhb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQyNjgsImV4cCI6MjA2NTQ5MDI2OH0.F2Ljk7v3WkXnuAZ2Vt4VUQKEuP_ZWTeTt7rVTTFGTI8"}`
          },
          body: JSON.stringify({ apartment }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setJokeError(`שגיאת בדיחה: ${errorData.error || res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data.joke) {
        setJoke(data.joke);
      } else {
        setJokeError("לא התקבלה בדיחה. נסה שוב מאוחר יותר.");
      }
    } catch (e: any) {
      setJokeError("שגיאת תקשורת. נסה שוב בעוד רגע.");
    } finally {
      setJokeLoading(false);
    }
  }, [apartment]);

  const openDialog = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setOpen(true);
    setAdvice(null);
    setAdviceError(null);
    setJoke(null);
    setJokeError(null);
    fetchAdvice();
    fetchJoke();
  }, [fetchAdvice, fetchJoke]);

  const onRetry = () => {
    fetchAdvice();
    fetchJoke();
  };

  return {
    open,
    setOpen,
    openDialog,
    advice,
    adviceLoading,
    adviceError,
    fetchAdvice,
    joke,
    jokeLoading,
    jokeError,
    fetchJoke,
    onRetry,
  };
}
