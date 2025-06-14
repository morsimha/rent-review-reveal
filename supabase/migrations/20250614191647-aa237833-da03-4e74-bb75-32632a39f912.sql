
-- הוסף עמודת האם יש מקלט (boolean) לדירות
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS has_shelter BOOLEAN DEFAULT NULL;

-- הוסף עמודת תאריך כניסה (date) לדירות
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT NULL;
