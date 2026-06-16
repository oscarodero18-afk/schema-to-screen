-- Add deposit_verified to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS deposit_verified BOOLEAN DEFAULT false;

-- Add image_url and video_url to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add INSERT policy for admins on commissions table
CREATE POLICY IF NOT EXISTS "Admins can insert commissions"
ON public.commissions
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
