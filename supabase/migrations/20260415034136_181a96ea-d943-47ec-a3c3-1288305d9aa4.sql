
-- Create a security definer function to check if a user has shared access to a session
-- This breaks the RLS recursion between sessions and session_shares
CREATE OR REPLACE FUNCTION public.has_shared_access(_user_id uuid, _session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.session_shares
    WHERE session_id = _session_id
      AND shared_with_user_id = _user_id
  )
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Shared users can view shared sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can CRUD own sessions" ON public.sessions;

-- Recreate policies using the security definer function
CREATE POLICY "Users can CRUD own sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Shared users can view shared sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (public.has_shared_access(auth.uid(), id));

-- Also fix session_shares policies to avoid recursion
DROP POLICY IF EXISTS "Session owners can manage shares" ON public.session_shares;

CREATE OR REPLACE FUNCTION public.is_session_owner(_user_id uuid, _session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE id = _session_id
      AND user_id = _user_id
  )
$$;

CREATE POLICY "Session owners can manage shares"
ON public.session_shares
FOR ALL
TO authenticated
USING (public.is_session_owner(auth.uid(), session_id))
WITH CHECK (public.is_session_owner(auth.uid(), session_id));

-- Fix dumps shared access policy too
DROP POLICY IF EXISTS "Shared users can view dumps in shared sessions" ON public.dumps;

CREATE POLICY "Shared users can view dumps in shared sessions"
ON public.dumps
FOR SELECT
TO authenticated
USING (public.has_shared_access(auth.uid(), session_id));

-- Fix write-shared dumps policy
DROP POLICY IF EXISTS "Write-shared users can create dumps" ON public.dumps;

CREATE OR REPLACE FUNCTION public.has_write_shared_access(_user_id uuid, _session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.session_shares
    WHERE session_id = _session_id
      AND shared_with_user_id = _user_id
      AND permission = 'write'
  )
$$;

CREATE POLICY "Write-shared users can create dumps"
ON public.dumps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_write_shared_access(auth.uid(), session_id));
