-- Tabela de logs de carga por exercício
CREATE TABLE public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  day_key TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight NUMERIC,
  sets INTEGER,
  reps TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_logs TO authenticated;
GRANT ALL ON public.exercise_logs TO service_role;

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own logs select" ON public.exercise_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own logs insert" ON public.exercise_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own logs update" ON public.exercise_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own logs delete" ON public.exercise_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_exercise_logs_user_exercise ON public.exercise_logs(user_id, exercise_name, performed_at DESC);
