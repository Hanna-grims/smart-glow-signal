import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Building2, TrafficCone } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ATMSCS" },
      {
        name: "description",
        content:
          "About the Adaptive Traffic Monitoring and Signal Control System thesis project.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <TrafficCone className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold md:text-4xl">Adaptive Traffic Monitoring & Signal Control System</h1>
          <p className="mt-2 text-muted-foreground">
            An engineering thesis project focused on real-time, camera-driven adaptive traffic signal control
            for two-way intersections using edge computing and computer vision.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> Thesis Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Member One (Placeholder)</li>
              <li>• Member Two (Placeholder)</li>
              <li>• Member Three (Placeholder)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-primary" /> Adviser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Engr. Adviser Name (Placeholder)</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" /> University
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">University Name (Placeholder) — College of Engineering</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {[
            "React Native",
            "Raspberry Pi",
            "Pi Camera",
            "ESP32",
            "OpenCV",
            "Supabase",
            "REST / JSON",
            "Realtime Sync",
          ].map((t) => (
            <div
              key={t}
              className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-center text-accent-foreground"
            >
              {t}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
