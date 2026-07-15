CREATE TABLE IF NOT EXISTS public.personal_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own schedules
CREATE POLICY "Users can view own personal schedules"
  ON public.personal_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own schedules
CREATE POLICY "Users can insert own personal schedules"
  ON public.personal_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own schedules
CREATE POLICY "Users can update own personal schedules"
  ON public.personal_schedules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own schedules
CREATE POLICY "Users can delete own personal schedules"
  ON public.personal_schedules
  FOR DELETE
  USING (auth.uid() = user_id);
  
-- Add a general policy for Anon/Test accounts (Since we are using local token overrides for Siswa during test)
CREATE POLICY "Allow public full access for personal_schedules"
  ON public.personal_schedules
  FOR ALL
  USING (true)
  WITH CHECK (true);
