
-- Body measurements table
CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  waist NUMERIC(5,2),
  abdomen NUMERIC(5,2),
  hip NUMERIC(5,2),
  chest NUMERIC(5,2),
  arm_left NUMERIC(5,2),
  arm_right NUMERIC(5,2),
  thigh_left NUMERIC(5,2),
  thigh_right NUMERIC(5,2),
  calf_left NUMERIC(5,2),
  calf_right NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measured_at DESC);
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own measurements select" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own measurements insert" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own measurements update" ON public.body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own measurements delete" ON public.body_measurements FOR DELETE USING (auth.uid() = user_id);

-- Progress photos table
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  pose TEXT NOT NULL CHECK (pose IN ('front','back','left','right')),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_progress_photos_user_date ON public.progress_photos(user_id, taken_at DESC);
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own photos select" ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own photos insert" ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own photos update" ON public.progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own photos delete" ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_body_measurements_updated
BEFORE UPDATE ON public.body_measurements
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users access only their own folder (user_id prefix)
CREATE POLICY "users read own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users update own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
