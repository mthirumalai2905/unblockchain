
-- Allow group members to add other users to sub-groups
CREATE POLICY "Group members can add to sub_groups"
  ON public.sub_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_sub_group_member(auth.uid(), sub_group_id)
    OR is_group_member(auth.uid(), (SELECT group_id FROM public.sub_groups WHERE id = sub_group_id))
  );
