import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Award, Flame, Target, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAppState } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { buildInsights, type Insight } from "@/lib/insights";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const profile = useAppState((s) => s.profile);
  const history = useAppState((s) => s.history);
  const plan = useAppState((s) => s.plan);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [weight, setWeight] = useState<{ week: string; peso: number }[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [{ data: meas }, { data: logs }] = await Promise.all([
          supabase
            .from("body_measurements")
            .select("*")
            .order("measured_at", { ascending: true }),
          supabase
            .from("exercise_logs")
            .select("exercise_name, weight, performed_at")
            .order("performed_at", { ascending: true }),
        ]);
        if (cancel) return;
        const measurements = meas ?? [];
        if (measurements.length > 0) {
          setWeight(
            measurements
              .filter((m) => m.weight != null)
              .slice(-12)
              .map((m, i) => ({
                week: new Date(m.measured_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                }),
                peso: Number(m.weight),
              })),
          );
        }
        const before = measurements[0];
        const after = measurements[measurements.length - 1];
        setInsights(
          buildInsights({
            before: before && after && before !== after ? (before as Parameters<typeof buildInsights>[0]["before"]) : undefined,
            after: before && after && before !== after ? (after as Parameters<typeof buildInsights>[0]["after"]) : undefined,
            history,
            plan: plan.map((d) => ({
              day: d.day,
              focus: d.focus,
              exercises: d.exercises.map((e) => ({ name: e.name, muscle: e.muscle })),
            })),
            logs: (logs ?? []).map((l) => ({
              exercise_name: l.exercise_name,
              weight: l.weight != null ? Number(l.weight) : null,
              performed_at: l.performed_at,
            })),
          }),
        );
      } catch (err) {
        console.error("insights", err);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [history, plan]);


  const goal = 70;
  const goalPct = Math.min(
    100,
    Math.max(0, ((((profile?.weight ?? 75) - goal) / (profile?.weight ?? 75)) * 100 + 70)),
  );

  const radial = [{ name: "Meta", value: Math.round(goalPct), fill: "var(--primary)" }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Sua evolução</h1>
        <p className="text-muted-foreground mt-1">Acompanhe seu progresso físico ao longo do tempo</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Peso corporal</p>
          <h2 className="text-2xl font-display font-bold mt-1">Últimas 12 semanas</h2>
          <div className="h-72 mt-4">
            {weight.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground text-center px-4">
                Registre suas medidas em "Minhas Medidas" para ver a evolução do peso.
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={weight}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ fill: "var(--primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

        </GlassCard>

        <GlassCard className="text-center">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Meta</p>
          <h3 className="text-xl font-display font-bold mt-1">Progresso geral</h3>
          <div className="h-48 -mt-2">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radial}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-32">
            <p className="text-4xl font-display font-bold gradient-text">{Math.round(goalPct)}%</p>
            <p className="text-xs text-muted-foreground mt-1">da meta atingida</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Metric icon={Flame} label="Sequência" value={`${Math.min(history.length, 12)} dias`} />
        <Metric icon={Target} label="Treinos completos" value={`${history.length}`} />
        <Metric icon={Award} label="IMC atual" value={
          profile ? ((profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)) : "—"
        } />
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Insights automáticos</h3>
        </div>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Registre medidas, fotos e cargas para receber análises automáticas da sua evolução.
          </p>
        ) : (
          <ul className="space-y-2">
            {insights.map((i, idx) => {
              const Icon = i.kind === "positive" ? CheckCircle2 : i.kind === "warning" ? AlertTriangle : TrendingUp;
              const color =
                i.kind === "positive"
                  ? "text-emerald-600 bg-emerald-500/10"
                  : i.kind === "warning"
                    ? "text-amber-600 bg-amber-500/10"
                    : "text-primary bg-primary/10";
              return (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-glass-border">
                  <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${color}`}>
                    <Icon className="size-4" />
                  </div>
                  <p className="text-sm leading-relaxed">{i.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="font-display font-bold text-lg mb-4">Histórico recente</h3>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Conclua treinos para começar seu histórico.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-glass-border"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {new Date(h.date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.completed}/{h.total} exercícios
                  </p>
                </div>
                <div className="text-sm font-bold text-primary">
                  {Math.round((h.completed / Math.max(1, h.total)) * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-primary/10 grid place-items-center">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
