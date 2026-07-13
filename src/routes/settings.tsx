import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Moon, Sun, Camera, Wifi, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [refresh, setRefresh] = useState([5]);
  const [piHost, setPiHost] = useState("raspberrypi.local");
  const [piPort, setPiPort] = useState("5000");

  useEffect(() => {
    // Read after mount to avoid hydration mismatch.
    const stored = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
    setDark(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
      <p className="mt-2 text-muted-foreground">Configure the operator dashboard.</p>

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
              Camera Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="res" className="text-sm">Resolution</Label>
              <Input id="res" defaultValue="1280x720" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fps" className="text-sm">Frame Rate (FPS)</Label>
              <Input id="fps" type="number" defaultValue={30} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-primary" />
              Raspberry Pi Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <div>
                <Label htmlFor="host" className="text-sm">Host</Label>
                <Input id="host" value={piHost} onChange={(e) => setPiHost(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="port" className="text-sm">Port</Label>
                <Input id="port" value={piPort} onChange={(e) => setPiPort(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto">Test Connection</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-primary" />
              Refresh Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto refresh every</Label>
              <span className="text-sm font-medium">{refresh[0]}s</span>
            </div>
            <Slider min={1} max={30} step={1} value={refresh} onValueChange={setRefresh} className="mt-3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
