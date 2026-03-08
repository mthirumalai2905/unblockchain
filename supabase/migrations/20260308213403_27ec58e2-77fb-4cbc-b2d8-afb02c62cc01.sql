
-- Table for delete votes on sub-groups
CREATE TABLE public.sub_group_delete_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_group_id uuid NOT NULL REFERENCES public.sub_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (sub_group_id, user_id)
);

ALTER TABLE public.sub_group_delete_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view delete votes"
  ON public.sub_group_delete_votes FOR SELECT
  TO authenticated
  USING (is_sub_group_member(auth.uid(), sub_group_id));

CREATE POLICY "Members can vote"
  ON public.sub_group_delete_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_sub_group_member(auth.uid(), sub_group_id));

CREATE POLICY "Users can update own vote"
  ON public.sub_group_delete_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote"
  ON public.sub_group_delete_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add last_activity_at to sub_groups for auto-cleanup tracking
ALTER TABLE public.sub_groups ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone NOT NULL DEFAULT now();

-- Update last_activity_at when a message is sent
CREATE OR REPLACE FUNCTION public.update_sub_group_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.sub_groups SET last_activity_at = now() WHERE id = NEW.sub_group_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_sub_group_activity
  AFTER INSERT ON public.sub_group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sub_group_activity();
