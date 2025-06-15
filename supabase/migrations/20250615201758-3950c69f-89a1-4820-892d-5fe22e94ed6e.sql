
-- הוספת עמודת scheduled_visit_text מסוג TEXT (nullable) 
ALTER TABLE public.apartments
ADD COLUMN scheduled_visit_text TEXT;
