import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import logoUrl from "@/assets/atmscs-logo.png";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — VC-Lane" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) navigate({ to: "/", replace: true });
      else setChecking(false);
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/", replace: true });
  };

  if (checking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-warm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-warm px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary p-3 shadow-soft ring-1 ring-white/40">
          <img
            src={logoUrl}
            alt="VC-Lane"
            className="h-full w-full object-contain [filter:brightness(0)_invert(1)]"
          />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">VC-Lane</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Operator Sign-in
        </p>
      </div>

      <Card className="w-full max-w-sm shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@vc-lane.local"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl"
              size="lg"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Accounts are created by the system administrator. Contact your adviser if you need access.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        VC-Lane Traffic Monitoring & Signal Control System
      </p>
    </div>
  );
}
