import { createFileRoute, notFound } from "@tanstack/react-router";
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
import { CameraFeed, SignalIndicator, SignalBadge } from "@/components/camera-feed";
import {
  useTrafficLight,
  useDetections,
  useSetSignal,
  dailyCounts,
  formatTime,
  timeAgo,
  type TrafficLightId,
} from "@/lib/traffic-api";
import {
  Camera,
  Wifi,
  WifiOff,
  Car,
  Bike,
  Truck,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/traffic-light/$id")({
  component: MonitorPage,
});

function MonitorPage() {
  const params = Route.useParams();
  const id = params.id.toUpperCase() as TrafficLightId;
  if (id !== "A" && id !== "B") throw notFound();

  const { data: light, isLoading } = useTrafficLight(id);
  const { data: detections = [] } = useDetections();
  const setSignal = useSetSignal();

  if (isLoading || !light) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 text-sm text-muted-foreground">
        Loading Traffic Light {id}…
      </div>
    );
  }

  const online = light.connection === "online";
  const recent = detections.filter((d) => d.light_id === id).slice(0, 8);
  const vehicles = dailyCounts(detections, id);
  const total = vehicles.Car + vehicles.Motorcycle + vehicles.Truck;

  const applyManual = (signal: "GREEN" | "RED") => {
    setSignal.mutate(
      { id, mode: "MANUAL", manual_signal: signal },
      {
        onSuccess: () => toast.success(`${light.name} forced to ${signal}`),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      },
    );
  };

  const returnToAuto = () => {
    setSignal.mutate(
      { id, mode: "AUTO" },
      {
        onSuccess: () => toast.success(`${light.name} switched to AUTO`),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-8">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Live Monitoring
          </div>
          <h1 className="truncate font-display text-xl font-semibold tracking-tight md:text-3xl">
            {light.name}
          </h1>
          <p className="mt-1 truncate text-xs text-muted-foreground md:text-sm">{light.location}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
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
          <span className="text-[10px] text-muted-foreground">{timeAgo(light.last_seen)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Camera Feed */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Live Camera Feed</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Source: Raspberry Pi Cam (MJPEG/HTTP)
                </p>
              </div>
              <Badge variant="outline" className="rounded-full">
                Mode: {light.mode}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CameraFeed streamUrl={light.stream_url} online={online} />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Camera:{" "}
                <span className={light.stream_url ? "text-signal-green" : "text-muted-foreground"}>
                  {light.stream_url ? "Configured" : "Not configured"}
                </span>
              </span>
              {light.stream_url && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[280px]">URL: {light.stream_url}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signal + Manual Control */}
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

          <Card className="shadow-soft border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Operator Control</CardTitle>
              <p className="text-xs text-muted-foreground">
                Override the automatic controller. ESP32 will apply within its next poll.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => applyManual("GREEN")}
                  disabled={setSignal.isPending}
                  className="bg-signal-green text-white hover:bg-signal-green/90"
                >
                  <Play className="mr-1 h-4 w-4" /> Force GO
                </Button>
                <Button
                  onClick={() => applyManual("RED")}
                  disabled={setSignal.isPending}
                  variant="destructive"
                >
                  <Pause className="mr-1 h-4 w-4" /> Force STOP
                </Button>
              </div>
              <Button
                onClick={returnToAuto}
                disabled={setSignal.isPending || light.mode === "AUTO"}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="mr-1 h-4 w-4" /> Return to AUTO
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-4 w-4 text-primary" /> Waiting Time
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 text-center">
              <div className="text-5xl font-bold text-primary">{light.waiting_time}</div>
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
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                      No detections yet. Have the Pi POST to /api/public/devices/detection.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{formatTime(r.detected_at)}</TableCell>
                      <TableCell>{r.vehicle_type}</TableCell>
                      <TableCell className="text-right">
                        <SignalBadge signal={r.signal} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
