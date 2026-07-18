-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    component_stack TEXT,
    url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert from anywhere (anon or authenticated)
CREATE POLICY "Allow public inserts to error_logs" ON public.error_logs
    FOR INSERT WITH CHECK (true);

-- Only admins can read error logs
CREATE POLICY "Allow admins to read error_logs" ON public.error_logs
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'superadmin' OR 
        (auth.jwt() ->> 'role_app' = 'admin')
    );
