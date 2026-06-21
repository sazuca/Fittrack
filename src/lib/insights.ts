// Heurísticas locais para gerar insights de evolução corporal e de treino.

type Measurement = {
  measured_at: string;
  weight: number | null;
  waist: number | null;
  hip: number | null;
  chest: number | null;
  arm_left: number | null;
  arm_right: number | null;
  thigh_left: number | null;
  thigh_right: number | null;
};

type HistoryEntry = { date: string; dayKey: string; completed: number; total: number };
type Plan = { day: string; focus: string; exercises: { name: string; muscle: string }[] }[];
type ExerciseLog = { exercise_name: string; weight: number | null; performed_at: string };

export type Insight = { kind: "positive" | "neutral" | "warning"; text: string };

function diff(a: number | null, b: number | null) {
  if (a == null || b == null) return null;
  return a - b;
}

export function compareMeasurements(before: Measurement, after: Measurement) {
  return {
    weight: diff(after.weight, before.weight),
    waist: diff(after.waist, before.waist),
    hip: diff(after.hip, before.hip),
    chest: diff(after.chest, before.chest),
    armAvg: avg(diff(after.arm_left, before.arm_left), diff(after.arm_right, before.arm_right)),
    thighAvg: avg(diff(after.thigh_left, before.thigh_left), diff(after.thigh_right, before.thigh_right)),
  };
}

function avg(a: number | null, b: number | null) {
  if (a == null && b == null) return null;
  if (a == null) return b;
  if (b == null) return a;
  return (a + b) / 2;
}

export function buildInsights(opts: {
  before?: Measurement;
  after?: Measurement;
  history: HistoryEntry[];
  plan: Plan;
  logs: ExerciseLog[];
}): Insight[] {
  const out: Insight[] = [];

  if (opts.before && opts.after) {
    const d = compareMeasurements(opts.before, opts.after);
    if (d.weight != null && Math.abs(d.weight) >= 0.5) {
      out.push({
        kind: d.weight < 0 ? "positive" : "neutral",
        text: `Variação de peso: ${d.weight > 0 ? "+" : ""}${d.weight.toFixed(1)} kg.`,
      });
    }
    if (d.waist != null && d.waist <= -1) {
      out.push({ kind: "positive", text: `Cintura reduziu ${Math.abs(d.waist).toFixed(1)} cm — ótimo sinal de queima de gordura.` });
    }
    if (d.armAvg != null && d.armAvg >= 0.5) {
      out.push({ kind: "positive", text: `Braços cresceram em média ${d.armAvg.toFixed(1)} cm.` });
    }
    if (d.thighAvg != null && d.thighAvg >= 0.5) {
      out.push({ kind: "positive", text: `Pernas evoluíram em média ${d.thighAvg.toFixed(1)} cm.` });
    }
    if (d.chest != null && d.chest >= 0.5) {
      out.push({ kind: "positive", text: `Tórax aumentou ${d.chest.toFixed(1)} cm.` });
    }
  }

  // Consistência: dias treinados no último mês
  if (opts.history.length > 0) {
    const last30 = opts.history.filter((h) => Date.now() - new Date(h.date).getTime() < 30 * 86400_000).length;
    if (last30 >= 16) out.push({ kind: "positive", text: `Excelente consistência: ${last30} treinos nos últimos 30 dias.` });
    else if (last30 >= 8) out.push({ kind: "neutral", text: `Boa frequência: ${last30} treinos nos últimos 30 dias.` });
    else out.push({ kind: "warning", text: `Frequência baixa: apenas ${last30} treinos nos últimos 30 dias.` });
  }

  // Frequência por grupo muscular
  const muscleFreq: Record<string, number> = {};
  for (const day of opts.plan) {
    for (const ex of day.exercises) {
      muscleFreq[ex.muscle] = (muscleFreq[ex.muscle] ?? 0) + 1;
    }
  }
  const entries = Object.entries(muscleFreq);
  if (entries.length) {
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const low = entries[entries.length - 1];
    if (top && top[1] >= 3) out.push({ kind: "neutral", text: `Maior volume semanal em ${top[0]}.` });
    if (low && top && low[0] !== top[0] && low[1] <= 1)
      out.push({ kind: "warning", text: `Pouco volume em ${low[0]} — considere incluir mais um exercício.` });
  }

  // Progressão de carga (últimas semanas)
  if (opts.logs.length >= 4) {
    const byExercise: Record<string, ExerciseLog[]> = {};
    for (const log of opts.logs) {
      if (!log.weight) continue;
      (byExercise[log.exercise_name] ??= []).push(log);
    }
    const stagnant: string[] = [];
    const progressing: string[] = [];
    for (const [name, list] of Object.entries(byExercise)) {
      if (list.length < 3) continue;
      const sorted = list.sort((a, b) => +new Date(a.performed_at) - +new Date(b.performed_at));
      const first = sorted[0].weight!;
      const last = sorted[sorted.length - 1].weight!;
      if (last - first >= first * 0.05) progressing.push(name);
      else if (Math.abs(last - first) < 0.5) stagnant.push(name);
    }
    if (progressing.length)
      out.push({ kind: "positive", text: `Progressão de carga em: ${progressing.slice(0, 3).join(", ")}.` });
    if (stagnant.length)
      out.push({ kind: "warning", text: `Sem evolução de carga em: ${stagnant.slice(0, 3).join(", ")} — tente aumentar 2,5–5%.` });
  }

  return out;
}
