import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { LogOut, ChevronLeft } from "lucide-react";
import logoUrl from "@/assets/atmscs-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const TITLES: Record<string, string> = {
  "/": "VC-Lane",
  "/logs": "Detection Logs",
  "/recordings": "Recordings",
  "/settings": "Settings",
  "/about": "About",
};

export function MobileHeader({ userEmail }: { userEmail?: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isMonitor = pathname.startsWith("/traffic-light/");
  const title = isMonitor
    ? `Traffic Light ${pathname.split("/").pop()?.toUpperCase() ?? ""}`
    : TITLES[pathname] ?? "VC-Lane";

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {isMonitor ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Back"
        >
          <Link to="/">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary p-1.5 shadow-soft ring-1 ring-white/40">
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full object-contain [filter:brightness(0)_invert(1)]"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold">{title}</div>
        {userEmail ? (
          <div className="truncate text-[10px] text-muted-foreground">{userEmail}</div>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={handleSignOut}
        aria-label="Sign out"
      >
        <LogOut className="h-4.5 w-4.5" />
      </Button>
    </header>
  );
}
