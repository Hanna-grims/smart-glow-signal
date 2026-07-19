// Mock data + types for the Adaptive Traffic Monitoring and Signal Control System.
// Structured so future integration with Supabase / REST APIs / Raspberry Pi is straightforward.

export type TrafficLightId = "A" | "B";
export type SignalStatus = "GREEN" | "RED";
export type ConnectionStatus = "online" | "offline";
export type VehicleType = "Car" | "Motorcycle" | "Truck";

export interface TrafficLight {
  id: TrafficLightId;
  name: string;
  location: string;
  connection: ConnectionStatus;
  signal: SignalStatus;
  waitingTime: number;
  lastUpdated: string;
}

export interface DetectionLog {
  id: string;
  timestamp: string;
  trafficLight: TrafficLightId;
  vehicleType: VehicleType;
  signal: SignalStatus;
}

export const trafficLights: Record<TrafficLightId, TrafficLight> = {
  A: {
    id: "A",
    name: "Traffic Light A",
    location: "Intersection 1 – Brgy.Tabi One Lane Road",
    connection: "online",
    signal: "GREEN",
    waitingTime: 12,
    lastUpdated: "Just now",
  },
  B: {
    id: "B",
    name: "Traffic Light B",
    location: "Intersection 1 – Brgy.Tabi One Lane Road",
    connection: "online",
    signal: "RED",
    waitingTime: 27,
    lastUpdated: "2s ago",
  },
};

const vehicleTypes: VehicleType[] = ["Car", "Motorcycle", "Truck"];

function makeLogs(): DetectionLog[] {
  // Spread mock detections across the last several days so logs are historical
  // while "today"-scoped counts remain a subset that resets at midnight.
  const out: DetectionLog[] = [];
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  // Today's detections (fresh counts)
  for (let i = 0; i < 24; i++) {
    const light: TrafficLightId = i % 2 === 0 ? "A" : "B";
    const type = vehicleTypes[i % vehicleTypes.length];
    const signal: SignalStatus = i % 3 === 0 ? "RED" : "GREEN";
    const ts = new Date(now - i * 5 * 60_000).toISOString();
    out.push({ id: `log-t-${i}`, timestamp: ts, trafficLight: light, vehicleType: type, signal });
  }

  // Previous days' history (kept in logs, excluded from daily counts)
  for (let d = 1; d <= 6; d++) {
    for (let i = 0; i < 18; i++) {
      const light: TrafficLightId = (d + i) % 2 === 0 ? "A" : "B";
      const type = vehicleTypes[(d + i) % vehicleTypes.length];
      const signal: SignalStatus = (d * i) % 3 === 0 ? "RED" : "GREEN";
      const ts = new Date(todayStart - d * 86_400_000 + i * 30 * 60_000).toISOString();
      out.push({ id: `log-${d}-${i}`, timestamp: ts, trafficLight: light, vehicleType: type, signal });
    }
  }

  return out.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const detectionLogs: DetectionLog[] = makeLogs();

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Returns vehicle detection counts for the given traffic light,
 * scoped to the current calendar day. Counts reset at midnight;
 * the underlying detection logs are kept indefinitely.
 */
export function getDailyVehicleCounts(id: TrafficLightId): Record<VehicleType, number> {
  const counts: Record<VehicleType, number> = { Car: 0, Motorcycle: 0, Truck: 0 };
  for (const log of detectionLogs) {
    if (log.trafficLight !== id) continue;
    if (!isToday(log.timestamp)) continue;
    counts[log.vehicleType] += 1;
  }
  return counts;
}

export function recentDetectionsFor(id: TrafficLightId, limit = 6): DetectionLog[] {
  return detectionLogs.filter((l) => l.trafficLight === id).slice(0, limit);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ============= Recordings (CCTV-style archive) =============

export interface Recording {
  id: string;
  trafficLight: TrafficLightId;
  /** ISO date (YYYY-MM-DD) the clip was captured on. */
  date: string;
  /** Start time of the clip, e.g. "08:15". */
  startTime: string;
  /** Duration in seconds. */
  duration: number;
  /** Number of vehicle events detected in the clip. */
  events: number;
  /** Thumbnail placeholder label (e.g. "Morning", "Midday"). */
  segment: "Morning" | "Midday" | "Afternoon" | "Evening" | "Night";
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function makeRecordings(): Recording[] {
  const out: Recording[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const segments: Array<{ start: string; label: Recording["segment"] }> = [
    { start: "06:00", label: "Morning" },
    { start: "10:30", label: "Midday" },
    { start: "14:00", label: "Afternoon" },
    { start: "17:30", label: "Evening" },
    { start: "21:00", label: "Night" },
  ];

  for (let d = 0; d <= 6; d++) {
    const day = new Date(today.getTime() - d * 86_400_000);
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    for (const light of ["A", "B"] as TrafficLightId[]) {
      segments.forEach((seg, i) => {
        out.push({
          id: `rec-${date}-${light}-${i}`,
          trafficLight: light,
          date,
          startTime: seg.start,
          duration: 900 + ((d + i) % 5) * 120, // 15–23 min
          events: 8 + ((d * 3 + i * 5 + (light === "A" ? 1 : 2)) % 22),
          segment: seg.label,
        });
      });
    }
  }
  return out;
}

export const recordings: Recording[] = makeRecordings();

export function recordingsFor(id: TrafficLightId | "ALL", date?: string): Recording[] {
  return recordings.filter(
    (r) => (id === "ALL" || r.trafficLight === id) && (!date || r.date === date),
  );
}

export function recordingDates(): string[] {
  return Array.from(new Set(recordings.map((r) => r.date))).sort((a, b) => b.localeCompare(a));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${pad(s)}`;
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "2-digit" });
}
