import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { GraduationCap, Users, Building2 } from "lucide-react";

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
      <PageHeader
        eyebrow="Thesis Project"
        title="Adaptive Traffic Monitoring & Signal Control System"
        description="An undergraduate engineering thesis on real-time, camera-driven adaptive traffic signal control for two-way intersections using edge computing and computer vision."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> Thesis Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm marker:text-primary">
              <li>Member One (Placeholder)</li>
              <li>Member Two (Placeholder)</li>
              <li>Member Three (Placeholder)</li>
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
            "React (TanStack Start)",
            "Raspberry Pi",
            "Pi Camera",
            "ESP32",
            "OpenCV",
            "Tailwind CSS",
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
