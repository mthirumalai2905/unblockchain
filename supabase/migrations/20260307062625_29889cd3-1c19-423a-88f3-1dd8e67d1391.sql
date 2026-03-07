
-- Threads table for dump replies
CREATE TABLE public.dump_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_dump_id UUID NOT NULL REFERENCES public.dumps(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dump_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own dump_threads"
  ON public.dump_threads
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
