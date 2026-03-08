
-- Allow group members to add other members (not just owners)
CREATE POLICY "Group members can add members"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(auth.uid(), group_id)
  );
