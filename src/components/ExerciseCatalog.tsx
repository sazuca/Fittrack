import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Plus, Dumbbell } from "lucide-react";
import {
  MUSCLE_CATEGORIES,
  listExercisesByCategory,
  searchExercises,
  type CatalogEntry,
  type MuscleCategory,
} from "@/lib/exercise-library";

export function ExerciseCatalog({
  onPick,
  onClose,
}: {
  onPick: (entry: CatalogEntry) => void;
  onClose: () => void;
}) {
  const [cat, setCat] = useState<MuscleCategory>("Peito");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    if (q.trim()) return searchExercises(q);
    return listExercisesByCategory(cat);
  }, [q, cat]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl glass-strong rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Catálogo</p>
            <h2 className="text-xl font-display font-bold tracking-tight">Adicionar exercício</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Navegue por grupo muscular ou busque pelo nome.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-muted/60 transition"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        <label className="relative block mb-3">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </label>

        {!q.trim() && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-3 [scrollbar-width:thin]">
            {MUSCLE_CATEGORIES.map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 px-3.5 min-h-9 rounded-full text-xs font-semibold transition ${
                    active
                      ? "gradient-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
                      : "bg-muted text-foreground/80 hover:bg-muted/70"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">Nenhum exercício encontrado.</p>
          )}
          {items.map((e) => (
            <button
              key={e.name}
              onClick={() => onPick(e)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/70 hover:bg-primary/10 border border-border transition text-left"
            >
              <div className="size-10 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
                <Dumbbell className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.category} · {e.defaultSets}x{e.defaultReps} · descanso {e.defaultRest}
                </p>
              </div>
              <div className="size-9 rounded-lg gradient-primary text-primary-foreground grid place-items-center shrink-0">
                <Plus className="size-4" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
