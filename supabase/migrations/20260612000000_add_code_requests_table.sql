-- Create code_requests table for agents to request agent codes from admins
CREATE TABLE IF NOT EXISTS public.code_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_requests ENABLE ROW LEVEL SECURITY;

-- Policies for code_requests
-- Agents can insert their own code request
CREATE POLICY "Agents can insert own code request"
    ON public.code_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Agents can view their own code request
CREATE POLICY "Agents can view own code request"
    ON public.code_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all code requests
CREATE POLICY "Admins can view all code requests"
    ON public.code_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update all code requests
CREATE POLICY "Admins can update all code requests"
    ON public.code_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_code_requests_user_id ON public.code_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_code_requests_status ON public.code_requests(status);
