import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import {
  recordings,
  recordingDates,
  formatDuration,
  formatDateLabel,
  type Recording,
  type TrafficLightId,
} from "@/lib/traffic-data";
import { Play, Video, Clock, Calendar, Download, Circle } from "lucide-react";

export const Route = createFileRoute("/recordings")({
  component: RecordingsPage,
});

function RecordingsPage() {
  const dates = useMemo(() => recordingDates(), []);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] ?? "");
  const [light, setLight] = useState<TrafficLightId | "ALL">("ALL");
  const [active, setActive] = useState<Recording | null>(null);

  const clips = useMemo(
    () =>
      recordings
        .filter(
          (r) =>
            r.date === selectedDate && (light === "ALL" || r.trafficLight === light),
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDate, light],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Archive"
        title="Recordings"
        description="Review recorded footage from previous days. Clips are grouped by date and traffic light, similar to a CCTV archive."
      />

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              {dates.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={selectedDate === d ? "default" : "outline"}
                  onClick={() => setSelectedDate(d)}
                  className="shrink-0 rounded-full"
                >
                  {formatDateLabel(d)}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["ALL", "A", "B"] as const).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={light === v ? "default" : "outline"}
                  onClick={() => setLight(v)}
                  className="rounded-full"
                >
                  {v === "ALL" ? "All Lights" : `Light ${v}`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {clips.length === 0 ? (
        <Card className="mt-6 shadow-soft">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No recordings for the selected filters.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onOpen={() => setActive(clip)} />
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Traffic Light {active.trafficLight} — {active.segment} clip
                </DialogTitle>
                <DialogDescription>
                  {formatDateLabel(active.date)} · Starts {active.startTime} ·{" "}
                  {formatDuration(active.duration)} · {active.events} detections
                </DialogDescription>
              </DialogHeader>
              <VideoPlayer clip={active} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export clip
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClipCard({ clip, onOpen }: { clip: Recording; onOpen: () => void }) {
  return (
    <Card className="group overflow-hidden shadow-soft transition hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-left"
        aria-label={`Play clip from Traffic Light ${clip.trafficLight}`}
      >
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur">
          <Circle className="h-2 w-2 fill-red-500 text-red-500" />
          REC
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
          CAM {clip.trafficLight}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between font-mono text-[10px] text-white/80">
          <span>{clip.date} {clip.startTime}:00</span>
          <span>{formatDuration(clip.duration)}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="h-6 w-6 translate-x-0.5" />
          </div>
        </div>
      </button>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-sm font-semibold">
              Light {clip.trafficLight} · {clip.segment}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {clip.startTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Video className="h-3 w-3" />
                {clip.events} events
              </span>
            </div>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {formatDateLabel(clip.date)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoPlayer({ clip }: { clip: Recording }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500 animate-pulse" />
        PLAYBACK
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 font-mono text-xs text-white backdrop-blur">
        CAM {clip.trafficLight}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
        <Video className="h-12 w-12" />
        <p className="text-sm">Recorded footage placeholder</p>
        <p className="text-xs text-white/50">
          Connect to camera storage to stream the archived clip.
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="mb-2 h-1 w-full rounded-full bg-white/20">
          <div className="h-1 w-1/3 rounded-full bg-primary" />
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-white/80">
          <span>{clip.date} {clip.startTime}:00</span>
          <span>00:00 / {formatDuration(clip.duration)}</span>
        </div>
      </div>
    </div>
  );
}
