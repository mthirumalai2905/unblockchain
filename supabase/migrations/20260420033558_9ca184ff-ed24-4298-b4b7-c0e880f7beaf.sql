-- Add profile fields for banner and bio
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add position field to dumps for drag-and-drop reordering
ALTER TABLE public.dumps
  ADD COLUMN IF NOT EXISTS position DOUBLE PRECISION;

-- Initialize position based on created_at for existing dumps (per session)
UPDATE public.dumps d
SET position = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) AS rn
  FROM public.dumps
) sub
WHERE d.id = sub.id AND d.position IS NULL;

CREATE INDEX IF NOT EXISTS idx_dumps_session_position ON public.dumps(session_id, position);