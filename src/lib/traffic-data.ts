// Mock data + types for the Adaptive Traffic Monitoring and Signal Control System.
// Structured so future integration with Supabase / REST APIs / Raspberry Pi is straightforward.

export type TrafficLightId = "A" | "B";
export type SignalStatus = "GREEN" | "RED";
export type ConnectionStatus = "online" | "offline";
export type VehicleType = "Car" | "Motorcycle" | "Truck" | "Bus";

export interface TrafficLight {
  id: TrafficLightId;
  name: string;
  location: string;
  connection: ConnectionStatus;
  signal: SignalStatus;
  waitingTime: number;
  lastUpdated: string;
  vehicles: Record<VehicleType, number>;
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
    location: "Intersection – Main St. & 1st Ave.",
    connection: "online",
    signal: "GREEN",
    waitingTime: 12,
    lastUpdated: "Just now",
    vehicles: { Car: 84, Motorcycle: 32, Truck: 9, Bus: 4 },
  },
  B: {
    id: "B",
    name: "Traffic Light B",
    location: "Intersection – Rizal Ave. & Park Rd.",
    connection: "online",
    signal: "RED",
    waitingTime: 27,
    lastUpdated: "2s ago",
    vehicles: { Car: 61, Motorcycle: 48, Truck: 6, Bus: 3 },
  },
};

const vehicleTypes: VehicleType[] = ["Car", "Motorcycle", "Truck", "Bus"];

function makeLogs(): DetectionLog[] {
  const out: DetectionLog[] = [];
  const now = Date.now();
  for (let i = 0; i < 40; i++) {
    const light: TrafficLightId = i % 2 === 0 ? "A" : "B";
    const type = vehicleTypes[i % 4];
    const signal: SignalStatus = i % 3 === 0 ? "RED" : "GREEN";
    const ts = new Date(now - i * 47_000).toISOString();
    out.push({
      id: `log-${i}`,
      timestamp: ts,
      trafficLight: light,
      vehicleType: type,
      signal,
    });
  }
  return out;
}

export const detectionLogs: DetectionLog[] = makeLogs();

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
