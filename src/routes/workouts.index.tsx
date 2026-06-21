import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Coffee } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { DAY_LABELS } from "@/lib/ai-workout";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/workouts/")({
  component: WorkoutsIndex,
});

function WorkoutsIndex() {
  const plan = useAppState((s) => s.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Seus treinos</h1>
        <p className="text-muted-foreground mt-1">Edite manualmente ou gere com IA — toque em um dia para começar</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAY_LABELS.map((d, i) => {
          const day = plan.find((p) => p.day === d.key);
          const isRest = !day || day.exercises.length === 0;
          const completed = day?.exercises.filter((e) => e.done).length ?? 0;
          const total = day?.exercises.length ?? 0;
          const pct = total ? (completed / total) * 100 : 0;

          return (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to="/workouts/$day" params={{ day: d.key }} className="block group">
                <GlassCard className="hover:border-primary/40 hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary font-bold">
                        {d.label}
                      </p>
                      <h3 className="text-2xl font-display font-bold mt-1">
                        {day?.title ?? "Descanso"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isRest ? "Recuperação ativa" : `${total} exercícios`}
                      </p>
                    </div>
                    <div
                      className={`size-11 rounded-xl grid place-items-center transition ${
                        isRest
                          ? "bg-muted text-muted-foreground"
                          : "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      }`}
                    >
                      {isRest ? <Coffee className="size-5" /> : <ChevronRight className="size-5" />}
                    </div>
                  </div>

                  {!isRest && (
                    <>
                      <div className="mt-5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full gradient-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {completed}/{total} concluídos
                      </p>
                    </>
                  )}
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
