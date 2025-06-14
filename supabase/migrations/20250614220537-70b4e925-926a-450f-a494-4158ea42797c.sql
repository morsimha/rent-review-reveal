
-- הוספת עמודת arnona (מספר, מותר Null) לטבלת הדירות
ALTER TABLE public.apartments
ADD COLUMN IF NOT EXISTS arnona INTEGER NULL;
