import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar, MobileNav } from "./AppSidebar";
import { actions, useAppState } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export function AppShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [authReady, setAuthReady] = useState(false);
  const authed = useAppState((s) => s.authed);
  const onboarded = useAppState((s) => s.onboarded);
  const dark = useAppState((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (data.user && !error) {
        await actions.restoreFromUser(data.user);
      } else {
        actions.clearAuth();
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void actions.restoreFromUser(session.user);
      } else {
        actions.clearAuth();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!authed && pathname !== "/login" && pathname !== "/") {
      navigate({ to: "/login" });
    } else if (authed && !onboarded && !pathname.startsWith("/onboarding")) {
      navigate({ to: "/onboarding" });
    }
  }, [authReady, authed, onboarded, pathname, navigate]);

  const isPublicRoute = pathname === "/login" || pathname === "/";

  if (!authReady && !isPublicRoute) {
    return <div className="min-h-screen mesh-bg grid place-items-center text-sm text-muted-foreground">Carregando...</div>;
  }

  const isAppRoute =
    authed && onboarded && !["/", "/login"].includes(pathname) && !pathname.startsWith("/onboarding");

  if (!isAppRoute) return <Outlet />;

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 p-4 lg:p-8 pb-28 lg:pb-8 max-w-[1500px] mx-auto w-full">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
