ALTER TABLE public.marriage_inquiries
ADD COLUMN dress_colors TEXT[] NOT NULL DEFAULT '{}';