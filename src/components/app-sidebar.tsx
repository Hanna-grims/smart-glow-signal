import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, TrafficCone, ListChecks, Settings, Info, Video } from "lucide-react";
import logoUrl from "@/assets/atmscs-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Traffic Light A", url: "/traffic-light/A", icon: TrafficCone },
  { title: "Traffic Light B", url: "/traffic-light/B", icon: TrafficCone },
  { title: "Detection Logs", url: "/logs", icon: ListChecks },
  { title: "Recordings", url: "/recordings", icon: Video },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary p-1.5 shadow-soft ring-1 ring-white/40">
            <img
              src={logoUrl}
              alt="ATMSCS logo"
              width={512}
              height={512}
              loading="lazy"
              className="h-full w-full object-contain [filter:brightness(0)_invert(1)]"
            />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate font-display text-sm font-bold tracking-tight">ATMSCS</div>
            <div className="truncate text-xs text-muted-foreground">Traffic Control</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
