-- Add target_amount column to profiles to fix schema cache error and allow KSH targets
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_amount NUMERIC;

-- Add created_by column to link agents to the admin who created/assigned them
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add index on created_by for performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);
