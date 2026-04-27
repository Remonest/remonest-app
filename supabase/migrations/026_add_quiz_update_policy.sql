-- Add UPDATE policy for user_quiz_attempts to support upsert
CREATE POLICY "Users can update own quiz attempts"
  ON public.user_quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
