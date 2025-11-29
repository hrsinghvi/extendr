-- Enable the pgcrypto extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table: stores user projects for the MCP app
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table: multiple chats per project
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table: messages belong to a chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$\n+BEGIN\n+  NEW.updated_at = NOW();\n+  RETURN NEW;\n+END;\n+$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chats_modtime BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Basic Row-Level Security (RLS) policies (adjust per needs)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_projects" ON public.projects FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "modify_own_projects" ON public.projects FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_chats" ON public.chats FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "modify_own_chats" ON public.chats FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_messages" ON public.messages FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "modify_own_messages" ON public.messages FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

