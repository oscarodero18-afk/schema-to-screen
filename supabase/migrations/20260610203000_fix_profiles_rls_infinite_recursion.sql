-- Fix infinite recursion in profiles RLS policies
-- by using a SECURITY DEFINER function to check admin status

-- Create a helper function to check if the current user is an admin
-- This function bypasses RLS to prevent infinite recursion when evaluating policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Revoke execute from public to ensure only authenticated users can call it securely
-- (Though SECURITY DEFINER already restricts it to the function's logic, this is best practice)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Recreate policies using the new is_admin() function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Ensure users can still view and update their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());
