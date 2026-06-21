import type { Exercise } from "./store";
import { CATALOG_ALL } from "./exercise-library";

export type GenGoal = "hypertrophy" | "fat_loss" | "strength" | "endurance";
export type GenLevel = "beginner" | "intermediate" | "advanced";

const GOAL_CFG: Record<GenGoal, { sets: number; reps: string; rest: string }> = {
  hypertrophy: { sets: 4, reps: "8-12", rest: "60-90s" },
  strength: { sets: 5, reps: "4-6", rest: "120s" },
  fat_loss: { sets: 3, reps: "12-15", rest: "30-45s" },
  endurance: { sets: 3, reps: "15-20", rest: "30s" },
};

const MUSCLE_TO_CATEGORY: Record<string, string[]> = {
  peito: ["Peito"],
  costas: ["Costas"],
  pernas: ["Pernas", "Glúteos", "Panturrilha"],
  ombros: ["Ombros"],
  bracos: ["Bíceps", "Tríceps"],
  core: ["Abdômen"],
};

export function generateDayExercises(opts: {
  goal: GenGoal;
  level: GenLevel;
  muscles: string[]; // keys of MUSCLE_TO_CATEGORY
  durationMin: number;
}): Exercise[] {
  const cfg = GOAL_CFG[opts.goal];
  const exCount = Math.max(3, Math.min(10, Math.round(opts.durationMin / 8)));
  const cats = opts.muscles.flatMap((m) => MUSCLE_TO_CATEGORY[m] ?? []);
  const pool = CATALOG_ALL.filter((e) => cats.includes(e.category));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, exCount);
  const setsAdj = opts.level === "beginner" ? Math.max(2, cfg.sets - 1) : opts.level === "advanced" ? cfg.sets + 1 : cfg.sets;

  return picked.map((e, idx) => ({
    id: `gen-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    name: e.name,
    muscle: e.category,
    sets: setsAdj,
    reps: cfg.reps,
    rest: cfg.rest,
  }));
}
