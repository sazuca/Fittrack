CREATE TABLE IF NOT EXISTS public.fittrack_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Atleta',
  weight NUMERIC(6,2) NOT NULL DEFAULT 75,
  height NUMERIC(6,2) NOT NULL DEFAULT 175,
  age INTEGER NOT NULL DEFAULT 25,
  gender TEXT NOT NULL DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  goal TEXT NOT NULL DEFAULT 'general' CHECK (goal IN ('hypertrophy', 'fat_loss', 'endurance', 'strength', 'general')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  experience_years NUMERIC(5,2) NOT NULL DEFAULT 0,
  days_per_week INTEGER NOT NULL DEFAULT 4,
  minutes_per_session INTEGER NOT NULL DEFAULT 60,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  notifications BOOLEAN NOT NULL DEFAULT true,
  workout_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  workout_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fittrack_profiles TO authenticated;
GRANT ALL ON public.fittrack_profiles TO service_role;

ALTER TABLE public.fittrack_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fittrack_profiles'
      AND policyname = 'Users can view own FitTrack profile'
  ) THEN
    CREATE POLICY "Users can view own FitTrack profile"
    ON public.fittrack_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fittrack_profiles'
      AND policyname = 'Users can create own FitTrack profile'
  ) THEN
    CREATE POLICY "Users can create own FitTrack profile"
    ON public.fittrack_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fittrack_profiles'
      AND policyname = 'Users can update own FitTrack profile'
  ) THEN
    CREATE POLICY "Users can update own FitTrack profile"
    ON public.fittrack_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fittrack_profiles'
      AND policyname = 'Users can delete own FitTrack profile'
  ) THEN
    CREATE POLICY "Users can delete own FitTrack profile"
    ON public.fittrack_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fittrack_profiles_user_id ON public.fittrack_profiles(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_fittrack_profiles_updated'
  ) THEN
    CREATE TRIGGER trg_fittrack_profiles_updated
    BEFORE UPDATE ON public.fittrack_profiles
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;