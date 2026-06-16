-- Add new fields for agent management to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS national_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS targets JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS territories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS performance_stats JSONB DEFAULT '{}'::jsonb;

-- Add index on national_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_national_id ON public.profiles(national_id);

-- Add index on agent_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_agent_code ON public.profiles(agent_code);
