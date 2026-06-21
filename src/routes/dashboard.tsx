import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Flame,
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Zap,
  Users,
  Star,
  MessageSquare,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { useAppState } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { DAY_LABELS } from "@/lib/ai-workout";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const todayKey = (() => {
  const d = new Date().getDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[d];
})();

function Dashboard() {
  const profile = useAppState((s) => s.profile);
  const role = useAppState((s) => s.role);
  const plan = useAppState((s) => s.plan);
  const linkedStudents = useAppState((s) => s.linkedStudents);
  const linkedTrainers = useAppState((s) => s.linkedTrainers);
  const subscriptionActive = useAppState((s) => s.subscriptionActive);
  const today = plan.find((d) => d.day === todayKey);
  const completed = today?.exercises.filter((e) => e.done).length ?? 0;
  const total = today?.exercises.length ?? 0;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const weekData = DAY_LABELS.map((d) => {
    const day = plan.find((p) => p.day === d.key);
    const c = day?.exercises.filter((e) => e.done).length ?? 0;
    const t = day?.exercises.length ?? 0;
    return { day: d.label.slice(0, 3), value: t ? Math.round((c / t) * 100) : 0, total: t };
  });

  const evolution = Array.from({ length: 8 }).map((_, i) => ({
    week: `S${i + 1}`,
    força: 62 + i * 4 + ((i * 3) % 7),
    volume: 104 + i * 6 + ((i * 5) % 11),
  }));

  if (role === "personal") {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Olá, {profile?.name?.split(" ")[0]} 👋</p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Painel do Personal</h1>
          <p className="text-muted-foreground mt-1">Aqui você gerencia seus alunos.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Alunos ativos" value={String(linkedStudents.length)} trend={subscriptionActive ? "Premium" : "Bloqueado"} />
          <Stat icon={Star} label="Avaliação média" value="4.8" trend="Excelente" />
          <Stat icon={MessageSquare} label="Mensagens" value="12" trend="Hoje" />
          <Stat icon={Award} label="Assinatura" value={subscriptionActive ? "Ativa" : "Pendente"} trend={subscriptionActive ? "Premium" : "Gratuito"} />
        </div>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Alunos Vinculados</p>
          {linkedStudents.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum aluno vinculado ainda. Os alunos aparecerão aqui quando contratarem você.
            </div>
          ) : (
            <div className="space-y-2">
              {linkedStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="size-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">
            Olá, {profile?.name?.split(" ")[0]} 👋
            {linkedTrainers.length > 0 && (
              <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Aluno de {linkedTrainers.length} Personal{linkedTrainers.length > 1 ? "is" : ""}
              </span>
            )}
          </p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
            Pronto para evoluir?
          </h1>
        </div>
        <Link
          to="/ai-builder"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-glow)]"
        >
          <Zap className="size-4" /> Gerar novo plano
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Flame} label="Treinos no mês" value="24" trend="+12%" />
        <Stat icon={Target} label="Meta semanal" value={`${profile?.daysPerWeek ?? 0}d`} trend="3/4" />
        <Stat icon={TrendingUp} label="Evolução força" value="+18%" trend="vs último mês" />
        <Stat icon={Dumbbell} label="Volume total" value="12.4t" trend="+8%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-48 rounded-full gradient-primary opacity-20 blur-3xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold">Treino de hoje</p>
              <h2 className="text-3xl font-display font-bold mt-1">{today?.title ?? "Descanso"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {total > 0 ? `${total} exercícios planejados` : "Aproveite para recuperar"}
              </p>
            </div>
            <div className="size-14 rounded-2xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
              <Dumbbell className="size-7 text-primary-foreground" />
            </div>
          </div>

          {total > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="font-semibold">{completed}/{total} concluídos</span>
                <span className="text-primary font-bold">{pct}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full gradient-primary"
                />
              </div>
            </>
          )}

          <Link
            to="/workouts/$day"
            params={{ day: todayKey }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
          >
            Iniciar treino <ArrowRight className="size-4" />
          </Link>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Progresso semanal</p>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={weekData}>
                <XAxis dataKey="day" stroke="currentColor" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold">Evolução física</p>
              <h3 className="text-xl font-display font-bold">Últimas 8 semanas</h3>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> Força
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary-glow" /> Volume
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={evolution}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="currentColor" fontSize={11} />
                <YAxis stroke="currentColor" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="força" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--primary-glow)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Calendário</p>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {DAY_LABELS.map((d) => {
              const day = plan.find((p) => p.day === d.key);
              const isToday = d.key === todayKey;
              return (
                <Link
                  key={d.key}
                  to="/workouts/$day"
                  params={{ day: d.key }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                    isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted/40"
                  }`}
                >
                  <div className={`size-9 rounded-lg grid place-items-center text-xs font-bold ${
                    isToday ? "bg-primary-foreground/20" : "bg-muted"
                  }`}>
                    {d.label.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{day?.title ?? "Descanso"}</p>
                    <p className={`text-xs truncate ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {day?.exercises.length ?? 0} exercícios
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
          <Icon className="size-5 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  );
}
