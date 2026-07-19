// REST endpoint for ESP32 / controllers to poll the current signal command.
//   GET /api/public/devices/signal/A
//   -> { light_id, signal, mode, manual_signal }
import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

export const Route = createFileRoute("/api/public/devices/signal/$id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params }) => {
        try {
          const id = params.id.toUpperCase();
          if (id !== "A" && id !== "B") {
            return new Response(JSON.stringify({ ok: false, error: "Unknown light" }), {
              status: 404,
              headers: CORS,
            });
          }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("traffic_lights")
            .select("id, signal, mode, manual_signal, waiting_time, updated_at")
            .eq("id", id)
            .maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("Not found");
          return new Response(JSON.stringify({ ok: true, ...data }), { status: 200, headers: CORS });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Server error";
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: CORS,
          });
        }
      },
    },
  },
});
