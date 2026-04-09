
-- Create permission enum
CREATE TYPE public.share_permission AS ENUM ('read', 'write');

-- Create session_shares table
CREATE TABLE public.session_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  permission share_permission NOT NULL DEFAULT 'read',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, shared_with_email)
);

ALTER TABLE public.session_shares ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their shares
CREATE POLICY "Session owners can manage shares"
ON public.session_shares
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_shares.session_id AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_shares.session_id AND s.user_id = auth.uid()
  )
);

-- Shared users can view shares for sessions shared with them
CREATE POLICY "Shared users can view their shares"
ON public.session_shares
FOR SELECT
TO authenticated
USING (shared_with_user_id = auth.uid());

-- Allow shared users to view session
CREATE POLICY "Shared users can view shared sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_shares ss
    WHERE ss.session_id = sessions.id AND ss.shared_with_user_id = auth.uid()
  )
);

-- Allow shared users to read dumps from shared sessions
CREATE POLICY "Shared users can view dumps in shared sessions"
ON public.dumps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_shares ss
    WHERE ss.session_id = dumps.session_id AND ss.shared_with_user_id = auth.uid()
  )
);

-- Allow write-shared users to create dumps in shared sessions
CREATE POLICY "Write-shared users can create dumps"
ON public.dumps
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.session_shares ss
    WHERE ss.session_id = dumps.session_id
    AND ss.shared_with_user_id = auth.uid()
    AND ss.permission = 'write'
  )
);

-- Function to resolve shared_with_user_id from email on insert
CREATE OR REPLACE FUNCTION public.resolve_share_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_id UUID;
BEGIN
  SELECT p.user_id INTO resolved_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE u.email = NEW.shared_with_email
  LIMIT 1;
  
  NEW.shared_with_user_id := resolved_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER resolve_share_user_id_trigger
BEFORE INSERT OR UPDATE ON public.session_shares
FOR EACH ROW
EXECUTE FUNCTION public.resolve_share_user_id();
