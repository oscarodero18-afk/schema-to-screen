-- Add detailed target columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_sales_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_amount_ksh numeric DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.target_sales_count IS 'Monthly sales count target for the agent';
COMMENT ON COLUMN public.profiles.target_amount_ksh IS 'Monthly sales amount target in KSH for the agent';

-- Ensure RLS allows admins to update these fields (already covered by existing admin policies, but good to be explicit if needed)
-- Existing policies on profiles should already allow admins to update all columns for agents.
