import { motion, AnimatePresence } from "framer-motion";
import { Timer, Plus, X } from "lucide-react";
import { useRestTimer } from "@/lib/rest-timer";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function RestTimerWidget() {
  const { running, remaining, duration, stop, addSeconds } = useRestTimer();
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed left-1/2 -translate-x-1/2 z-[60] bottom-24 lg:bottom-6 w-[min(92vw,360px)] glass-strong rounded-2xl p-3 shadow-[var(--shadow-elegant)] flex items-center gap-3"
        >
          <div className="relative size-14 shrink-0 grid place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--muted)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
              />
            </svg>
            <Timer className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Descanso</p>
            <p className="text-2xl font-display font-bold tabular-nums">{fmt(remaining)}</p>
          </div>
          <button
            onClick={() => addSeconds(15)}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition"
            aria-label="Adicionar 15 segundos"
          >
            <Plus className="size-4" />
            <span className="sr-only">+15s</span>
          </button>
          <button
            onClick={stop}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
            aria-label="Parar timer"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RestTimerPresets({ onStart }: { onStart?: () => void }) {
  const { start } = useRestTimer();
  const presets = [30, 45, 60, 90, 120];
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((s) => (
        <button
          key={s}
          onClick={() => {
            start(s);
            onStart?.();
          }}
          className="px-4 min-h-11 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition"
        >
          {s}s
        </button>
      ))}
    </div>
  );
}
