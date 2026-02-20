
-- Create twitter_connections table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.twitter_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  connected_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twitter_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own twitter_connections"
  ON public.twitter_connections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_twitter_connections_updated_at
  BEFORE UPDATE ON public.twitter_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create twitter_analyses table to store analysis results
CREATE TABLE IF NOT EXISTS public.twitter_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  config_json JSONB NOT NULL DEFAULT '{}',
  tweets_json JSONB NOT NULL DEFAULT '[]',
  ai_output_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twitter_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own twitter_analyses"
  ON public.twitter_analyses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
