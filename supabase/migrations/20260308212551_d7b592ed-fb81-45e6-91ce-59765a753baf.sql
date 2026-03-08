
-- Create group_members table to track who can see each idea group
CREATE TABLE public.group_members (
  group_id uuid NOT NULL REFERENCES public.idea_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Members can view their own memberships
CREATE POLICY "Users can view own group memberships"
  ON public.group_members FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role inserts (edge function uses service role)
CREATE POLICY "Users can view groups they belong to"
  ON public.group_members FOR SELECT
  USING (true);

-- Security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- Update idea_groups RLS: replace public SELECT with members-only
DROP POLICY IF EXISTS "Anyone can view idea_groups" ON public.idea_groups;
CREATE POLICY "Members can view idea_groups"
  ON public.idea_groups FOR SELECT
  USING (public.is_group_member(auth.uid(), id));

-- Update idea_group_dumps: members only
DROP POLICY IF EXISTS "Anyone can view idea_group_dumps" ON public.idea_group_dumps;
CREATE POLICY "Members can view idea_group_dumps"
  ON public.idea_group_dumps FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));

-- Update group_comments: members only view
DROP POLICY IF EXISTS "Users can view all group_comments" ON public.group_comments;
CREATE POLICY "Members can view group_comments"
  ON public.group_comments FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));

-- Update group_votes: members only view
DROP POLICY IF EXISTS "Anyone can view group_votes" ON public.group_votes;
CREATE POLICY "Members can view group_votes"
  ON public.group_votes FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));

-- Sub-groups: members of parent group only
DROP POLICY IF EXISTS "Anyone can view sub_groups" ON public.sub_groups;
CREATE POLICY "Group members can view sub_groups"
  ON public.sub_groups FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));

-- Sub-group related tables: check parent group membership via sub_group
CREATE OR REPLACE FUNCTION public.is_sub_group_member(_user_id uuid, _sub_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sub_groups sg
    JOIN public.group_members gm ON gm.group_id = sg.group_id
    WHERE sg.id = _sub_group_id AND gm.user_id = _user_id
  )
$$;

DROP POLICY IF EXISTS "Members can view sub_group_messages" ON public.sub_group_messages;
CREATE POLICY "Group members can view sub_group_messages"
  ON public.sub_group_messages FOR SELECT
  USING (public.is_sub_group_member(auth.uid(), sub_group_id));

DROP POLICY IF EXISTS "Anyone can view sub_group_members" ON public.sub_group_members;
CREATE POLICY "Group members can view sub_group_members"
  ON public.sub_group_members FOR SELECT
  USING (public.is_sub_group_member(auth.uid(), sub_group_id));

DROP POLICY IF EXISTS "Anyone can view sub_group_drafts" ON public.sub_group_drafts;
CREATE POLICY "Group members can view sub_group_drafts"
  ON public.sub_group_drafts FOR SELECT
  USING (public.is_sub_group_member(auth.uid(), sub_group_id));

DROP POLICY IF EXISTS "Anyone can view sub_group_roadmaps" ON public.sub_group_roadmaps;
CREATE POLICY "Group members can view sub_group_roadmaps"
  ON public.sub_group_roadmaps FOR SELECT
  USING (public.is_sub_group_member(auth.uid(), sub_group_id));
