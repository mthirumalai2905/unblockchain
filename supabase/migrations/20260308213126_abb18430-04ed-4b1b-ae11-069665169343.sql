
-- Backfill: add group creators as members
INSERT INTO public.group_members (group_id, user_id)
SELECT id, user_id FROM public.idea_groups
ON CONFLICT DO NOTHING;

-- Auto-add creator as member when a new group is created
CREATE OR REPLACE FUNCTION public.auto_add_group_creator_as_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (NEW.id, NEW.user_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_add_group_creator
  AFTER INSERT ON public.idea_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_group_creator_as_member();

-- Allow group owners to add members
CREATE POLICY "Group owners can add members"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.idea_groups
      WHERE idea_groups.id = group_members.group_id
      AND idea_groups.user_id = auth.uid()
    )
  );
