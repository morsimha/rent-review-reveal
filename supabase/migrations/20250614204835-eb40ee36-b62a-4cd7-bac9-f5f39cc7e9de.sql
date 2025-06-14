
-- נוסיף עמודה לטיוטה זמנית של הציור בטבלת המשחקים השיתופיים (game_sessions)
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS draft_canvas_data TEXT;

-- לא נדרש עדכון RLS כי כל פעולות הכתיבה/קריאה כבר פתוחות לציבור
