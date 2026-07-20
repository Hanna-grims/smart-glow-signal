-- Restrict traffic data access to signed-in operators.
DROP POLICY IF EXISTS "Public read traffic_lights" ON public.traffic_lights;
DROP POLICY IF EXISTS "Public insert traffic_lights" ON public.traffic_lights;
DROP POLICY IF EXISTS "Public update traffic_lights" ON public.traffic_lights;

CREATE POLICY "Operators read traffic_lights"
  ON public.traffic_lights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators update traffic_lights"
  ON public.traffic_lights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.traffic_lights FROM anon;
GRANT SELECT ON public.traffic_lights TO authenticated;
GRANT UPDATE ON public.traffic_lights TO authenticated;

DROP POLICY IF EXISTS "Public read detections" ON public.detections;
DROP POLICY IF EXISTS "Public insert detections" ON public.detections;

CREATE POLICY "Operators read detections"
  ON public.detections FOR SELECT TO authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.detections FROM anon;
REVOKE SELECT ON public.detections FROM anon;
REVOKE SELECT ON public.traffic_lights FROM anon;
GRANT SELECT ON public.detections TO authenticated;