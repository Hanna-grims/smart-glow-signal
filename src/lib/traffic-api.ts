// Live data layer backed by Lovable Cloud (Supabase).
// Reads via TanStack Query + realtime subscriptions; mutations for operator control.
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TrafficLightId = "A" | "B";
export type SignalStatus = "GREEN" | "RED" | "YELLOW";
export type ConnectionStatus = "online" | "offline";
export type ControlMode = "AUTO" | "MANUAL";
export type VehicleType = "Car" | "Motorcycle" | "Truck";

export interface TrafficLight {
  id: TrafficLightId;
  name: string;
  location: string;
  signal: SignalStatus;
  mode: ControlMode;
  manual_signal: SignalStatus | null;
  connection: ConnectionStatus;
  waiting_time: number;
  stream_url: string | null;
  last_seen: string | null;
  updated_at: string;
}

export interface Detection {
  id: string;
  light_id: TrafficLightId;
  vehicle_type: VehicleType;
  signal: SignalStatus | null;
  confidence: number | null;
  detected_at: string;
}

// -------- Queries --------

async function fetchLights(): Promise<TrafficLight[]> {
  const { data, error } = await supabase
    .from("traffic_lights")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data ?? []) as unknown as TrafficLight[];
}

async function fetchDetections(limit = 500): Promise<Detection[]> {
  const { data, error } = await supabase
    .from("detections")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Detection[];
}

export function useTrafficLights() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["traffic_lights"], queryFn: fetchLights });

  useEffect(() => {
    const channel = supabase
      .channel("traffic_lights_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "traffic_lights" },
        () => {
          qc.invalidateQueries({ queryKey: ["traffic_lights"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

export function useTrafficLight(id: TrafficLightId) {
  const { data, ...rest } = useTrafficLights();
  return { data: data?.find((l) => l.id === id), ...rest };
}

export function useDetections(limit = 500) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["detections", limit],
    queryFn: () => fetchDetections(limit),
  });

  useEffect(() => {
    const channel = supabase
      .channel("detections_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "detections" },
        () => {
          qc.invalidateQueries({ queryKey: ["detections"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

// -------- Mutations (operator controls) --------

export function useSetSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      mode,
      manual_signal,
    }: {
      id: TrafficLightId;
      mode: ControlMode;
      manual_signal?: SignalStatus | null;
    }) => {
      const patch: {
        mode: ControlMode;
        manual_signal?: SignalStatus | null;
        signal?: SignalStatus;
      } = { mode };
      if (mode === "MANUAL" && manual_signal) {
        patch.manual_signal = manual_signal;
        patch.signal = manual_signal;
      }
      if (mode === "AUTO") {
        patch.manual_signal = null;
      }
      const { error } = await supabase
        .from("traffic_lights")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["traffic_lights"] }),
  });
}

export function useUpdateStreamUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stream_url }: { id: TrafficLightId; stream_url: string | null }) => {
      const { error } = await supabase
        .from("traffic_lights")
        .update({ stream_url })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["traffic_lights"] }),
  });
}

// -------- Helpers --------

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

export function dailyCounts(
  detections: Detection[],
  id: TrafficLightId,
): Record<VehicleType, number> {
  const c: Record<VehicleType, number> = { Car: 0, Motorcycle: 0, Truck: 0 };
  for (const d of detections) {
    if (d.light_id !== id) continue;
    if (!isToday(d.detected_at)) continue;
    c[d.vehicle_type] += 1;
  }
  return c;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return new Date(iso).toLocaleString();
}
