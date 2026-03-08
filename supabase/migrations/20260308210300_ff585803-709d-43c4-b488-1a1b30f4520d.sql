
-- Sub-groups belonging to idea_groups
CREATE TABLE public.sub_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.idea_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sub_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_groups" ON public.sub_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create sub_groups" ON public.sub_groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update sub_groups" ON public.sub_groups
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete sub_groups" ON public.sub_groups
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Sub-group members
CREATE TABLE public.sub_group_members (
  sub_group_id uuid NOT NULL REFERENCES public.sub_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sub_group_id, user_id)
);

ALTER TABLE public.sub_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_group_members" ON public.sub_group_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join sub_groups" ON public.sub_group_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sub_groups" ON public.sub_group_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sub-group chat messages
CREATE TABLE public.sub_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_group_id uuid NOT NULL REFERENCES public.sub_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sub_group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view sub_group_messages" ON public.sub_group_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can send sub_group_messages" ON public.sub_group_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Sub-group drafts (PRDs)
CREATE TABLE public.sub_group_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_group_id uuid NOT NULL REFERENCES public.sub_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled PRD',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sub_group_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_group_drafts" ON public.sub_group_drafts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create sub_group_drafts" ON public.sub_group_drafts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creator can update sub_group_drafts" ON public.sub_group_drafts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Sub-group roadmaps
CREATE TABLE public.sub_group_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_group_id uuid NOT NULL REFERENCES public.sub_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Roadmap',
  phases_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sub_group_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sub_group_roadmaps" ON public.sub_group_roadmaps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create sub_group_roadmaps" ON public.sub_group_roadmaps
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creator can update sub_group_roadmaps" ON public.sub_group_roadmaps
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.sub_group_messages;
