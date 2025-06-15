
-- Create a table for patient access tokens
CREATE TABLE public.patient_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_id UUID NOT NULL REFERENCES public.summaries(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add an index on summary_id for faster lookups
CREATE INDEX idx_patient_access_tokens_summary_id ON public.patient_access_tokens(summary_id);

-- Add an index on the token for faster lookups
CREATE INDEX idx_patient_access_tokens_token ON public.patient_access_tokens(token);

-- Enable RLS for the new table
ALTER TABLE public.patient_access_tokens ENABLE ROW LEVEL SECURITY;

-- Allow read access for anon role. We will validate the token in an edge function.
CREATE POLICY "Enable read access for all users" ON "public"."patient_access_tokens"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);
