import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Dumbbell,
  Sparkles,
  TrendingUp,
  Ruler,
  Camera,
  Settings,
  LogOut,
  Activity,
  Video,
  UserCheck,
} from "lucide-react";
import { actions, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

function useSidebarItems(role: "aluno" | "personal") {
  if (role === "personal") {
    return [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/workouts", label: "Treinos", icon: Dumbbell },
      { to: "/personal-trainer", label: "Meus Alunos", icon: UserCheck },
      { to: "/settings", label: "Configurações", icon: Settings },
    ];
  }
  return [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/workouts", label: "Treinos", icon: Dumbbell },
    { to: "/ai-builder", label: "IA Builder", icon: Sparkles },
    { to: "/exercises", label: "Exercícios", icon: Video },
    { to: "/personal-trainer", label: "Personal", icon: UserCheck },
    { to: "/progress", label: "Evolução", icon: TrendingUp },
    { to: "/measurements", label: "Medidas", icon: Ruler },
    { to: "/photos", label: "Fotos", icon: Camera },
    { to: "/settings", label: "Configurações", icon: Settings },
  ];
}


export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const profile = useAppState((s) => s.profile);
  const role = useAppState((s) => s.role);
  const items = useSidebarItems(role);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 m-4 mr-0 rounded-3xl bg-sidebar text-sidebar-foreground p-5 sticky top-4 h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
          <Activity className="size-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display font-bold tracking-tight">FitTrack</p>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">{role === "personal" ? "Personal" : "Premium"}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
              )}
            >
              <Icon className="size-4" />
              <span className="font-medium">{it.label}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl p-4 bg-sidebar-accent/40 border border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full gradient-primary grid place-items-center font-bold text-primary-foreground">
              {profile?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.name ?? "Atleta"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={actions.signOut}
            className="mt-3 w-full text-xs flex items-center justify-center gap-2 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/70 transition"
          >
            <LogOut className="size-3" /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useAppState((s) => s.role);
  const mobItems = useSidebarItems(role);
  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 glass-strong rounded-2xl px-2 py-2 flex gap-1 overflow-x-auto justify-start">
      {mobItems.map((it) => {
        const active = pathname === it.to || pathname.startsWith(it.to + "/");
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex min-w-[4.25rem] flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition",
              active ? "bg-primary text-primary-foreground" : "text-foreground/70",
            )}
          >
            <Icon className="size-4" />
            <span className="text-[10px] font-medium">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
