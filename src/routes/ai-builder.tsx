import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Zap } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { actions, useAppState, type Profile } from "@/lib/store";
import { generatePlan, DAY_LABELS } from "@/lib/ai-workout";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-builder")({
  component: AIBuilder,
});

function AIBuilder() {
  const profile = useAppState((s) => s.profile);
  const plan = useAppState((s) => s.plan);
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [overrides, setOverrides] = useState<Partial<Profile>>({
    daysPerWeek: profile?.daysPerWeek,
    minutesPerSession: profile?.minutesPerSession,
    goal: profile?.goal,
  });

  function regenerate() {
    if (!profile) return;
    const hasCustomized = plan.some((d) => d.customized);
    if (hasCustomized) {
      const ok = confirm(
        "Você tem dias editados manualmente. Deseja manter as edições e regenerar apenas os outros dias? (Cancelar regenera tudo)",
      );
      setGenerating(true);
      setTimeout(() => {
        const merged = { ...profile, ...overrides } as Profile;
        const newPlan = generatePlan(merged);
        actions.updateProfile(overrides);
        if (ok) actions.mergePlanKeepingCustom(newPlan);
        else actions.setPlan(newPlan);
        setGenerating(false);
        toast.success(ok ? "Plano regenerado (dias editados preservados)" : "Plano totalmente regenerado");
        navigate({ to: "/workouts" });
      }, 800);
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const merged = { ...profile, ...overrides } as Profile;
      const newPlan = generatePlan(merged);
      actions.updateProfile(overrides);
      actions.setPlan(newPlan);
      setGenerating(false);
      toast.success("Plano regenerado pela IA!");
      navigate({ to: "/workouts" });
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
          <Sparkles className="size-3" /> IA Fitness
        </span>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
          Construa seu treino com IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajuste suas preferências e gere um novo plano personalizado.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 space-y-5">
          <div>
            <label className="text-sm font-medium">Dias por semana</label>
            <input
              type="range"
              min={1}
              max={7}
              value={overrides.daysPerWeek ?? 4}
              onChange={(e) => setOverrides((o) => ({ ...o, daysPerWeek: Number(e.target.value) }))}
              className="w-full accent-primary mt-2"
            />
            <div className="text-2xl font-display font-bold text-primary">
              {overrides.daysPerWeek ?? 4}d
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Minutos por sessão</label>
            <input
              type="range"
              min={20}
              max={120}
              step={5}
              value={overrides.minutesPerSession ?? 60}
              onChange={(e) =>
                setOverrides((o) => ({ ...o, minutesPerSession: Number(e.target.value) }))
              }
              className="w-full accent-primary mt-2"
            />
            <div className="text-2xl font-display font-bold text-primary">
              {overrides.minutesPerSession ?? 60} min
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Objetivo</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { v: "hypertrophy", l: "Hipertrofia" },
                { v: "fat_loss", l: "Emagrecer" },
                { v: "strength", l: "Força" },
                { v: "endurance", l: "Resistência" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setOverrides((s) => ({ ...s, goal: o.v as Profile["goal"] }))}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    overrides.goal === o.v
                      ? "gradient-primary text-primary-foreground"
                      : "glass border border-glass-border"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={regenerate}
            disabled={generating}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="size-4" />
                </motion.span>
                Gerando…
              </>
            ) : (
              <>
                <Zap className="size-4" /> Gerar novo plano
              </>
            )}
          </button>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Plano atual</p>
          <h2 className="text-2xl font-display font-bold mt-1 mb-4">Divisão semanal</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {DAY_LABELS.map((d) => {
              const day = plan.find((p) => p.day === d.key);
              return (
                <div key={d.key} className="p-4 rounded-xl bg-muted/30 border border-glass-border">
                  <div className="flex items-start justify-between">
                    <p className="text-xs uppercase font-bold text-muted-foreground">{d.label}</p>
                    {day?.customized && (
                      <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        Editado
                      </span>
                    )}
                  </div>
                  <p className="font-display font-bold mt-1">{day?.title ?? "Descanso"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {day?.exercises.length ?? 0} exercícios
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
