import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Video, Settings, Info } from "lucide-react";

const tabs = [
  { title: "Home", url: "/", icon: Home, match: (p: string) => p === "/" || p.startsWith("/traffic-light") },
  { title: "Logs", url: "/logs", icon: ListChecks, match: (p: string) => p.startsWith("/logs") },
  { title: "Clips", url: "/recordings", icon: Video, match: (p: string) => p.startsWith("/recordings") },
  { title: "Settings", url: "/settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
  { title: "About", url: "/about", icon: Info, match: (p: string) => p.startsWith("/about") },
];

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.url}>
              <Link
                to={tab.url}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon
                  className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`}
                  aria-hidden="true"
                />
                <span>{tab.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
