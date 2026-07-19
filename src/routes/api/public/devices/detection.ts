// REST endpoint for hardware (Raspberry Pi / OpenCV pipeline) to POST vehicle detections.
// Example:
//   POST /api/public/devices/detection
//   { "light_id": "A", "vehicle_type": "Car", "signal": "GREEN", "confidence": 0.92 }
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

const Body = z.object({
  light_id: z.enum(["A", "B"]),
  vehicle_type: z.enum(["Car", "Motorcycle", "Truck"]),
  signal: z.enum(["GREEN", "RED", "YELLOW"]).optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  detected_at: z.string().optional(),
});

export const Route = createFileRoute("/api/public/devices/detection")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const data = Body.parse(json);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("detections").insert({
            light_id: data.light_id,
            vehicle_type: data.vehicle_type,
            signal: data.signal ?? null,
            confidence: data.confidence ?? null,
            detected_at: data.detected_at ?? new Date().toISOString(),
          });
          if (error) throw error;
          return new Response(JSON.stringify({ ok: true }), { status: 201, headers: CORS });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Bad request";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 400,
            headers: CORS,
          });
        }
      },
    },
  },
});
