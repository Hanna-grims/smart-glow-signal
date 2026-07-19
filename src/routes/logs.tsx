import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useDetections, formatDateTime, type TrafficLightId } from "@/lib/traffic-api";
import { SignalBadge } from "@/components/camera-feed";
import { Search } from "lucide-react";

export const Route = createFileRoute("/logs")({
  component: LogsPage,
});

function LogsPage() {
  const [query, setQuery] = useState("");
  const [light, setLight] = useState<TrafficLightId | "ALL">("ALL");
  const [date, setDate] = useState("");
  const { data: detections = [], isLoading } = useDetections(2000);

  const filtered = useMemo(() => {
    return detections.filter((log) => {
      if (light !== "ALL" && log.light_id !== light) return false;
      if (date) {
        const d = new Date(log.detected_at).toISOString().slice(0, 10);
        if (d !== date) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        return (
          log.vehicle_type.toLowerCase().includes(q) ||
          (log.signal ?? "").toLowerCase().includes(q) ||
          log.light_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [detections, query, light, date]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Records"
        title="Detection Logs"
        description="Search and filter recorded vehicle detections from both traffic lights. Historical entries are retained; daily counters reset each day."
      />

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vehicle type, signal, or light..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
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
                  {v === "ALL" ? "All" : `Light ${v}`}
                </Button>
              ))}
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="md:w-44"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Traffic Light</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead className="text-right">Signal Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No detections match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{formatDateTime(l.detected_at)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Light {l.light_id}
                      </span>
                    </TableCell>
                    <TableCell>{l.vehicle_type}</TableCell>
                    <TableCell className="text-right">
                      <SignalBadge signal={l.signal} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
