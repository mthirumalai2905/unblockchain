
-- Allow all authenticated users to SELECT social dumps
CREATE POLICY "Anyone can view social dumps" ON public.dumps FOR SELECT TO authenticated
  USING (mode = 'social');

-- Allow all authenticated users to view idea groups
CREATE POLICY "Anyone can view idea_groups" ON public.idea_groups FOR SELECT TO authenticated
  USING (true);

-- Allow all authenticated users to view group dumps links
CREATE POLICY "Anyone can view idea_group_dumps" ON public.idea_group_dumps FOR SELECT TO authenticated
  USING (true);

-- Allow all authenticated users to view group votes
CREATE POLICY "Anyone can view group_votes" ON public.group_votes FOR SELECT TO authenticated
  USING (true);
