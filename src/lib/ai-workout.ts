import type { DayKey, Exercise, Profile, WorkoutDay } from "./store";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

export const DAY_LABELS = DAYS;

const SPLITS: Record<number, string[]> = {
  3: ["Push", "Pull", "Legs"],
  4: ["Upper", "Lower", "Push", "Pull"],
  5: ["Peito", "Costas", "Pernas", "Ombros", "Braços"],
  6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
  7: ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio"],
  2: ["Full Body A", "Full Body B"],
  1: ["Full Body"],
};

const POOL: Record<string, string[]> = {
  Peito: ["Supino reto", "Supino inclinado halteres", "Crucifixo", "Crossover", "Flexão de braço"],
  Costas: ["Puxada frontal", "Remada curvada", "Remada baixa", "Pull-down", "Levantamento terra"],
  Pernas: ["Agachamento livre", "Leg press", "Cadeira extensora", "Mesa flexora", "Stiff", "Panturrilha"],
  Ombros: ["Desenvolvimento militar", "Elevação lateral", "Elevação frontal", "Face pull"],
  Braços: ["Rosca direta", "Rosca martelo", "Tríceps pulley", "Tríceps francês", "Rosca scott"],
  Core: ["Prancha", "Abdominal infra", "Russian twist", "Mountain climber"],
  Cardio: ["Esteira intervalada", "Bike", "Pular corda", "Remo ergômetro"],
  Push: ["Supino reto", "Desenvolvimento", "Elevação lateral", "Tríceps pulley", "Crucifixo"],
  Pull: ["Puxada frontal", "Remada curvada", "Face pull", "Rosca direta", "Rosca martelo"],
  Legs: ["Agachamento", "Leg press", "Stiff", "Cadeira extensora", "Panturrilha"],
  Upper: ["Supino", "Remada", "Desenvolvimento", "Puxada", "Rosca", "Tríceps"],
  Lower: ["Agachamento", "Leg press", "Stiff", "Cadeira flexora", "Panturrilha"],
  "Full Body": ["Agachamento", "Supino", "Remada", "Desenvolvimento", "Prancha"],
  "Full Body A": ["Agachamento", "Supino", "Remada curvada", "Desenvolvimento"],
  "Full Body B": ["Levantamento terra", "Supino inclinado", "Puxada", "Elevação lateral"],
};

function repsForGoal(goal: Profile["goal"]) {
  switch (goal) {
    case "hypertrophy":
      return { sets: 4, reps: "8-12", rest: "60-90s" };
    case "strength":
      return { sets: 5, reps: "4-6", rest: "120s" };
    case "fat_loss":
      return { sets: 3, reps: "12-15", rest: "30-45s" };
    case "endurance":
      return { sets: 3, reps: "15-20", rest: "30s" };
    default:
      return { sets: 3, reps: "10-12", rest: "60s" };
  }
}

export function generatePlan(profile: Profile): WorkoutDay[] {
  const days = Math.min(7, Math.max(1, profile.daysPerWeek));
  const split = SPLITS[days] ?? SPLITS[3];
  const cfg = repsForGoal(profile.goal);
  const exCount = Math.max(4, Math.min(8, Math.round(profile.minutesPerSession / 10)));

  return DAYS.slice(0, 7).map((d, i) => {
    if (i >= days) {
      return { day: d.key, title: "Descanso", focus: "Recovery", exercises: [] };
    }
    const focus = split[i % split.length];
    const pool = POOL[focus] ?? POOL["Full Body"];
    const exercises: Exercise[] = pool.slice(0, exCount).map((name, idx) => ({
      id: `${d.key}-${idx}`,
      name,
      muscle: focus,
      sets: cfg.sets,
      reps: cfg.reps,
      rest: cfg.rest,
    }));
    return { day: d.key, title: focus, focus, exercises };
  });
}
