import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  trafficLights,
  recentDetectionsFor,
  formatTime,
  getDailyVehicleCounts,
  type TrafficLightId,
} from "@/lib/traffic-data";
import { CameraPlaceholder, SignalIndicator } from "@/routes/index";
import { Camera, RefreshCw, Wifi, WifiOff, Car, Bike, Truck, Timer, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/traffic-light/$id")({
  component: MonitorPage,
});

function MonitorPage() {
  const params = Route.useParams();
  const id = params.id.toUpperCase() as TrafficLightId;
  if (id !== "A" && id !== "B") throw notFound();
  const light = trafficLights[id];
  const online = light.connection === "online";
  const recent = recentDetectionsFor(id);
  const vehicles = getDailyVehicleCounts(id);
  const total = vehicles.Car + vehicles.Motorcycle + vehicles.Truck;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1 h-8 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold md:text-4xl"><span className="text-gradient-primary">{light.name}</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">{light.location}</p>
        </div>
        <Badge
          variant="outline"
          className={
            online
              ? "border-signal-green/40 bg-signal-green/10 text-signal-green"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }
        >
          {online ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
          {online ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Camera Feed */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Live Raspberry Pi Camera Feed</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Last updated: {light.lastUpdated}</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <CameraPlaceholder />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Camera Status:{" "}
                <span className={online ? "text-signal-green" : "text-destructive"}>
                  {online ? "Streaming" : "Disconnected"}
                </span>
              </span>
              <span>·</span>
              <span>Resolution: 1280×720</span>
              <span>·</span>
              <span>Source: Raspberry Pi Cam</span>
            </div>
          </CardContent>
        </Card>

        {/* Signal + Wait */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Traffic Signal</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <SignalIndicator signal={light.signal} size="lg" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Status</div>
                <div
                  className={`mt-1 text-2xl font-bold ${
                    light.signal === "GREEN" ? "text-signal-green" : "text-destructive"
                  }`}
                >
                  {light.signal === "GREEN" ? "GO" : "STOP"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-4 w-4 text-primary" /> Current Waiting Time
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 text-center">
              <div className="text-5xl font-bold text-primary">{light.waitingTime}</div>
              <div className="mt-1 text-xs text-muted-foreground">seconds</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vehicle Detection */}
      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Vehicle Detection</h2>
          <span className="text-xs text-muted-foreground">
            Counts reset daily · Logs are kept
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <VehicleStat label="Total Today" value={total} accent />
          <VehicleStat label="Cars" value={vehicles.Car} icon={<Car className="h-4 w-4" />} />
          <VehicleStat label="Motorcycles" value={vehicles.Motorcycle} icon={<Bike className="h-4 w-4" />} />
          <VehicleStat label="Trucks" value={vehicles.Truck} icon={<Truck className="h-4 w-4" />} />
        </div>
      </div>

      {/* Recent Detections */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Recent Vehicle Detections</h2>
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead className="text-right">Signal Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{formatTime(r.timestamp)}</TableCell>
                    <TableCell>{r.vehicleType}</TableCell>
                    <TableCell className="text-right">
                      <SignalBadge signal={r.signal} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VehicleStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className={`shadow-soft ${accent ? "border-primary/30 bg-primary/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={`mt-2 text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function SignalBadge({ signal }: { signal: "GREEN" | "RED" }) {
  if (signal === "GREEN") {
    return (
      <Badge className="border-signal-green/40 bg-signal-green/10 text-signal-green" variant="outline">
        GO
      </Badge>
    );
  }
  return (
    <Badge className="border-destructive/40 bg-destructive/10 text-destructive" variant="outline">
      STOP
    </Badge>
  );
}
