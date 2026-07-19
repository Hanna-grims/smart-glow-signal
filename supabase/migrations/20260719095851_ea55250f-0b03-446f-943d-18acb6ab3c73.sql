
CREATE TABLE public.traffic_lights (
  id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  signal text NOT NULL DEFAULT 'RED' CHECK (signal IN ('GREEN','RED','YELLOW')),
  mode text NOT NULL DEFAULT 'AUTO' CHECK (mode IN ('AUTO','MANUAL')),
  manual_signal text CHECK (manual_signal IN ('GREEN','RED','YELLOW')),
  connection text NOT NULL DEFAULT 'offline' CHECK (connection IN ('online','offline')),
  waiting_time integer NOT NULL DEFAULT 0,
  stream_url text,
  last_seen timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_lights TO anon, authenticated;
GRANT ALL ON public.traffic_lights TO service_role;
ALTER TABLE public.traffic_lights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read traffic_lights" ON public.traffic_lights FOR SELECT USING (true);
CREATE POLICY "Public update traffic_lights" ON public.traffic_lights FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public insert traffic_lights" ON public.traffic_lights FOR INSERT WITH CHECK (true);

CREATE TABLE public.detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  light_id text NOT NULL REFERENCES public.traffic_lights(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('Car','Motorcycle','Truck')),
  signal text CHECK (signal IN ('GREEN','RED','YELLOW')),
  confidence numeric,
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX detections_light_time_idx ON public.detections (light_id, detected_at DESC);
CREATE INDEX detections_time_idx ON public.detections (detected_at DESC);

GRANT SELECT, INSERT ON public.detections TO anon, authenticated;
GRANT ALL ON public.detections TO service_role;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read detections" ON public.detections FOR SELECT USING (true);
CREATE POLICY "Public insert detections" ON public.detections FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER traffic_lights_touch BEFORE UPDATE ON public.traffic_lights
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_lights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detections;
ALTER TABLE public.traffic_lights REPLICA IDENTITY FULL;
ALTER TABLE public.detections REPLICA IDENTITY FULL;

INSERT INTO public.traffic_lights (id, name, location, signal, mode, connection, waiting_time)
VALUES
 ('A','Traffic Light A','Intersection 1 – Brgy.Tabi One Lane Road','GREEN','AUTO','offline',0),
 ('B','Traffic Light B','Intersection 1 – Brgy.Tabi One Lane Road','RED','AUTO','offline',0);
