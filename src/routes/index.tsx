import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { trafficLights, type TrafficLight } from "@/lib/traffic-data";
import { Camera, Wifi, WifiOff, ArrowRight, Activity, Timer } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const lights = [trafficLights.A, trafficLights.B];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Operator Dashboard"
        title="Live Traffic Overview"
        description="Select a traffic light to open its live monitoring view."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatMini icon={<Activity className="h-4 w-4" />} label="Active Signals" value="2 / 2" />
        <StatMini icon={<Camera className="h-4 w-4" />} label="Cameras Online" value="2" />
        <StatMini icon={<Timer className="h-4 w-4" />} label="Avg. Wait" value="19s" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {lights.map((l) => (
          <LightCard key={l.id} light={l} />
        ))}
      </div>
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

function LightCard({ light }: { light: TrafficLight }) {
  const online = light.connection === "online";
  return (
    <Card className="overflow-hidden border-border shadow-soft transition-transform hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-xl">{light.name}</CardTitle>
          <p className="mt-1 truncate text-sm text-muted-foreground">{light.location}</p>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <CameraPlaceholder />
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div>
            <div className="text-xs text-muted-foreground">Current Signal</div>
            <div className="mt-1 text-lg font-semibold">
              {light.signal === "GREEN" ? "GO" : "STOP"}
            </div>
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

export function CameraPlaceholder() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted to-accent/40">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Camera className="h-8 w-8" />
          <span className="text-xs font-medium">Camera Preview</span>
        </div>
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-xs backdrop-blur">
        <span className="h-2 w-2 animate-pulse-glow rounded-full bg-destructive" />
        LIVE
      </div>
    </div>
  );
}

export function SignalIndicator({ signal, size = "md" }: { signal: "GREEN" | "RED"; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${dim} rounded-full ${signal === "GREEN" ? "signal-dot-green animate-pulse-glow" : "signal-dot-dim"}`}
        aria-label="Green signal"
      />
      <div
        className={`${dim} rounded-full ${signal === "RED" ? "signal-dot-red animate-pulse-glow" : "signal-dot-dim"}`}
        aria-label="Red signal"
      />
    </div>
  );
}
