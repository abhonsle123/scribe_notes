
ALTER TABLE public.summaries
ADD COLUMN chat_history JSONB;

COMMENT ON COLUMN public.summaries.chat_history IS 'Stores the conversation history for the summary chatbox.';
