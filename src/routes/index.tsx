import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { CameraFeed, SignalIndicator } from "@/components/camera-feed";
import {
  useTrafficLights,
  useDetections,
  dailyCounts,
  timeAgo,
  type TrafficLight,
} from "@/lib/traffic-api";
import { Wifi, WifiOff, ArrowRight, Activity, Camera, Timer } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: lights = [], isLoading } = useTrafficLights();
  const { data: detections = [] } = useDetections();

  const onlineCount = lights.filter((l) => l.connection === "online").length;
  const cameras = lights.filter((l) => l.stream_url && l.connection === "online").length;
  const avgWait = lights.length
    ? Math.round(lights.reduce((s, l) => s + (l.waiting_time || 0), 0) / lights.length)
    : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Operator Dashboard"
        title="Live Traffic Overview"
        description="Select a traffic light to open its live monitoring view."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatMini icon={<Activity className="h-4 w-4" />} label="Active Signals" value={`${onlineCount} / ${lights.length}`} />
        <StatMini icon={<Camera className="h-4 w-4" />} label="Cameras Online" value={String(cameras)} />
        <StatMini icon={<Timer className="h-4 w-4" />} label="Avg. Wait" value={`${avgWait}s`} />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading live data…</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {lights.map((l) => {
            const counts = dailyCounts(detections, l.id);
            const total = counts.Car + counts.Motorcycle + counts.Truck;
            return <LightCard key={l.id} light={l} todayTotal={total} />;
          })}
        </div>
      )}
    </div>
  );
}

function StatMini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function LightCard({ light, todayTotal }: { light: TrafficLight; todayTotal: number }) {
  const online = light.connection === "online";
  return (
    <Card className="overflow-hidden border-border shadow-soft transition-transform hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-xl">{light.name}</CardTitle>
          <p className="mt-1 truncate text-sm text-muted-foreground">{light.location}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Last seen: {timeAgo(light.last_seen)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
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
          {light.mode === "MANUAL" && (
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Manual
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CameraFeed streamUrl={light.stream_url} online={online} />
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div>
            <div className="text-xs text-muted-foreground">Current Signal</div>
            <div className="mt-1 text-lg font-semibold">
              {light.signal === "GREEN" ? "GO" : light.signal === "RED" ? "STOP" : "YIELD"}
            </div>
            <div className="text-xs text-muted-foreground">Today: {todayTotal} vehicles</div>
          </div>
          <SignalIndicator signal={light.signal} />
        </div>
        <Button asChild size="lg" className="w-full rounded-xl">
          <Link to="/traffic-light/$id" params={{ id: light.id }}>
            Monitor {light.name}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
