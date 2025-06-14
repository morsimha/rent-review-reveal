
-- הוספת עמודות דירוג למור ולגבי
ALTER TABLE public.apartments 
ADD COLUMN mor_rating INTEGER DEFAULT 0 CHECK (mor_rating >= 0 AND mor_rating <= 5),
ADD COLUMN gabi_rating INTEGER DEFAULT 0 CHECK (gabi_rating >= 0 AND gabi_rating <= 5);

-- יצירת bucket לתמונות דירות
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apartment-images', 'apartment-images', true);

-- יצירת מדיניות לאפשר לכולם לראות תמונות
CREATE POLICY "Anyone can view apartment images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'apartment-images');

-- יצירת מדיניות לאפשר לכולם להעלות תמונות
CREATE POLICY "Anyone can upload apartment images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'apartment-images');

-- יצירת מדיניות לאפשר לכולם לעדכן תמונות
CREATE POLICY "Anyone can update apartment images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'apartment-images');

-- יצירת מדיניות לאפשר לכולם למחוק תמונות
CREATE POLICY "Anyone can delete apartment images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'apartment-images');
