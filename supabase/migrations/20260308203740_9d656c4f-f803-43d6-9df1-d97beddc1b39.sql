
-- Add mode and ai_label columns to dumps
ALTER TABLE public.dumps ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'normal';
ALTER TABLE public.dumps ADD COLUMN IF NOT EXISTS ai_label text;

-- Idea groups table
CREATE TABLE public.idea_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.idea_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own idea_groups" ON public.idea_groups FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Join table: which dumps belong to which group
CREATE TABLE public.idea_group_dumps (
  group_id uuid NOT NULL REFERENCES public.idea_groups(id) ON DELETE CASCADE,
  dump_id uuid NOT NULL REFERENCES public.dumps(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, dump_id)
);
ALTER TABLE public.idea_group_dumps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own idea_group_dumps" ON public.idea_group_dumps FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.idea_groups WHERE idea_groups.id = idea_group_dumps.group_id AND idea_groups.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.idea_groups WHERE idea_groups.id = idea_group_dumps.group_id AND idea_groups.user_id = auth.uid()));

-- Group votes
CREATE TABLE public.group_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.idea_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
ALTER TABLE public.group_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own group_votes" ON public.group_votes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Group comments
CREATE TABLE public.group_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.idea_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.group_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own group_comments" ON public.group_comments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all group_comments" ON public.group_comments FOR SELECT TO authenticated
  USING (true);
