import { Camera } from "lucide-react";

interface CameraFeedProps {
  streamUrl?: string | null;
  online?: boolean;
  label?: string;
}

/**
 * Live camera feed. Renders an MJPEG/HTTP stream when `streamUrl` is provided
 * (e.g. Raspberry Pi Motion / mjpg-streamer / OpenCV Flask endpoint).
 * Falls back to a placeholder when no stream is configured.
 */
export function CameraFeed({ streamUrl, online = true, label = "LIVE" }: CameraFeedProps) {
  const hasStream = Boolean(streamUrl);
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted to-accent/40">
      {hasStream ? (
        <img
          src={streamUrl!}
          alt="Live camera feed"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="h-8 w-8" />
            <span className="text-xs font-medium">
              {online ? "No stream URL configured" : "Camera offline"}
            </span>
            <span className="text-[10px] uppercase tracking-wider">Set it in Settings</span>
          </div>
        </div>
      )}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-xs backdrop-blur">
        <span
          className={`h-2 w-2 rounded-full ${
            hasStream && online ? "bg-destructive animate-pulse-glow" : "bg-muted-foreground"
          }`}
        />
        {label}
      </div>
    </div>
  );
}

export function SignalIndicator({
  signal,
  size = "md",
}: {
  signal: "GREEN" | "RED" | "YELLOW";
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${dim} rounded-full ${
          signal === "GREEN" ? "signal-dot-green animate-pulse-glow" : "signal-dot-dim"
        }`}
        aria-label="Green signal"
      />
      <div
        className={`${dim} rounded-full ${
          signal === "RED" ? "signal-dot-red animate-pulse-glow" : "signal-dot-dim"
        }`}
        aria-label="Red signal"
      />
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
export function SignalBadge({ signal }: { signal: "GREEN" | "RED" | "YELLOW" | null }) {
  if (signal === "GREEN") {
    return (
      <Badge className="border-signal-green/40 bg-signal-green/10 text-signal-green" variant="outline">
        GO
      </Badge>
    );
  }
  if (signal === "RED") {
    return (
      <Badge className="border-destructive/40 bg-destructive/10 text-destructive" variant="outline">
        STOP
      </Badge>
    );
  }
  return <Badge variant="outline">—</Badge>;
}
