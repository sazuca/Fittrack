import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Sparkles, TrendingUp, ArrowRight, Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen mesh-bg">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
            <Activity className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">FitTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted/40">
            Entrar
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold px-4 py-2 rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Começar
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-semibold text-primary mb-6">
            <Sparkles className="size-3" /> Personal Trainer com IA
          </span>
          <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[1.05]">
            Seu corpo.
            <br />
            <span className="gradient-text">Sua evolução.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-md">
            Treinos personalizados gerados por IA, dashboards premium e acompanhamento real da
            sua evolução física.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition"
            >
              Começar agora <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-semibold"
            >
              Entrar
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <GlassCard className="col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Treino de hoje</p>
                <p className="font-display text-2xl font-bold">Push Day</p>
              </div>
              <div className="size-12 rounded-xl gradient-primary grid place-items-center">
                <Dumbbell className="size-6 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-2/3 gradient-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">8 de 12 exercícios concluídos</p>
          </GlassCard>
          <GlassCard>
            <TrendingUp className="size-5 text-primary mb-2" />
            <p className="text-3xl font-bold font-display">+18%</p>
            <p className="text-xs text-muted-foreground">Força semanal</p>
          </GlassCard>
          <GlassCard>
            <Sparkles className="size-5 text-primary mb-2" />
            <p className="text-3xl font-bold font-display">28</p>
            <p className="text-xs text-muted-foreground">Treinos no mês</p>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
