// REST endpoint for Raspberry Pi / ESP32 to report live state:
// current signal, waiting time, and online status.
//   POST /api/public/devices/heartbeat
//   { "light_id": "A", "signal": "GREEN", "waiting_time": 12 }
// When the light is in MANUAL mode the operator override is preserved and returned.
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
  signal: z.enum(["GREEN", "RED", "YELLOW"]).optional(),
  waiting_time: z.number().int().min(0).optional(),
});

export const Route = createFileRoute("/api/public/devices/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const data = Body.parse(await request.json());
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: current, error: readErr } = await supabaseAdmin
            .from("traffic_lights")
            .select("mode, manual_signal")
            .eq("id", data.light_id)
            .maybeSingle();
          if (readErr) throw readErr;
          if (!current) throw new Error("Unknown light_id");

          const patch: {
            connection: "online";
            last_seen: string;
            waiting_time?: number;
            signal?: "GREEN" | "RED" | "YELLOW";
          } = {
            connection: "online",
            last_seen: new Date().toISOString(),
          };
          if (typeof data.waiting_time === "number") patch.waiting_time = data.waiting_time;

          // In MANUAL mode the operator override wins; otherwise use the reported signal.
          if (current.mode === "MANUAL" && current.manual_signal) {
            patch.signal = current.manual_signal as "GREEN" | "RED" | "YELLOW";
          } else if (data.signal) {
            patch.signal = data.signal;
          }

          const { data: updated, error } = await supabaseAdmin
            .from("traffic_lights")
            .update(patch)
            .eq("id", data.light_id)
            .select("id, mode, signal, manual_signal")
            .single();
          if (error) throw error;

          return new Response(
            JSON.stringify({
              ok: true,
              command: {
                mode: updated.mode,
                signal: updated.signal,
                manual_signal: updated.manual_signal,
              },
            }),
            { status: 200, headers: CORS },
          );
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
