
-- להוסיף עמודות סימון לדירה עבור שיחה עם מור וגבי
ALTER TABLE public.apartments
ADD COLUMN spoke_with_mor boolean DEFAULT false,
ADD COLUMN spoke_with_gabi boolean DEFAULT false;
