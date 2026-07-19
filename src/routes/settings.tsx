import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Moon, Sun, Camera, Wifi, Save } from "lucide-react";
import { useTrafficLights, useUpdateStreamUrl, type TrafficLightId } from "@/lib/traffic-api";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const { data: lights = [] } = useTrafficLights();
  const updateStream = useUpdateStreamUrl();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored =
      typeof window !== "undefined" && document.documentElement.classList.contains("dark");
    setDark(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const saveStream = (id: TrafficLightId, current: string | null) => {
    const value = drafts[id] ?? current ?? "";
    updateStream.mutate(
      { id, stream_url: value.trim() || null },
      {
        onSuccess: () => toast.success(`Camera URL saved for Light ${id}`),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Configure the operator dashboard and connected hardware."
      />

      <div className="mt-6 space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {dark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme.</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4 text-primary" />
              Camera Streams
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Set the Raspberry Pi MJPEG/HTTP camera URL for each traffic light. The dashboard renders it
              live. Example: <code>http://192.168.1.42:8080/stream</code>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {lights.map((l) => (
              <div key={l.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                <div>
                  <Label htmlFor={`stream-${l.id}`} className="text-sm">
                    {l.name} — Camera URL
                  </Label>
                  <Input
                    id={`stream-${l.id}`}
                    placeholder="http://raspberrypi.local:8080/stream"
                    value={drafts[l.id] ?? l.stream_url ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [l.id]: e.target.value }))}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => saveStream(l.id, l.stream_url)}
                    disabled={updateStream.isPending}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-1 h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-primary" />
              Hardware REST Endpoints
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Use these endpoints on the Raspberry Pi and ESP32 to integrate with the dashboard. All
              accept JSON.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Endpoint
              method="POST"
              path="/api/public/devices/detection"
              desc="Pi posts a vehicle detection."
              body={`{"light_id":"A","vehicle_type":"Car","signal":"GREEN","confidence":0.92}`}
            />
            <Endpoint
              method="POST"
              path="/api/public/devices/heartbeat"
              desc="Pi/ESP32 reports current signal and waiting time; returns operator override."
              body={`{"light_id":"A","signal":"GREEN","waiting_time":12}`}
            />
            <Endpoint
              method="GET"
              path="/api/public/devices/signal/A"
              desc="ESP32 polls the current signal command for Light A."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  desc,
  body,
}: {
  method: string;
  path: string;
  desc: string;
  body?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
          {method}
        </span>
        <code className="font-mono">{path}</code>
      </div>
      <p className="mt-1 text-muted-foreground">{desc}</p>
      {body && <pre className="mt-2 overflow-x-auto rounded bg-background p-2 font-mono">{body}</pre>}
    </div>
  );
}
