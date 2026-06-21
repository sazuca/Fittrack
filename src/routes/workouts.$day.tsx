import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clock,
  Dumbbell,
  Repeat,
  Trophy,
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  Info,
  Timer,
  Save,
  PlayCircle,
  Sparkles,
  X,
  Heart,
  Wind,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { InlineExerciseVideo } from "@/components/InlineExerciseVideo";
import { ExerciseCatalog } from "@/components/ExerciseCatalog";
import { RestTimerPresets } from "@/components/RestTimerWidget";
import { useRestTimer } from "@/lib/rest-timer";
import { DAY_LABELS } from "@/lib/ai-workout";
import { actions, useAppState, type DayKey, type Exercise } from "@/lib/store";
import { generateDayExercises, type GenGoal, type GenLevel } from "@/lib/generate-day";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workouts/$day")({
  component: WorkoutDayPage,
});

function WorkoutDayPage() {
  const { day } = Route.useParams();
  const dayKey = day as DayKey;
  const plan = useAppState((s) => s.plan);
  const dayPlan = plan.find((p) => p.day === dayKey);
  const label = DAY_LABELS.find((d) => d.key === dayKey)?.label ?? "";
  const [editing, setEditing] = useState(false);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editEx, setEditEx] = useState<Exercise | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [openVideoIds, setOpenVideoIds] = useState<Set<string>>(new Set());
  const { start: startTimer } = useRestTimer();

  function toggleVideo(id: string) {
    setOpenVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!dayPlan || dayPlan.exercises.length === 0) {
    return (
      <div className="space-y-4">
        <Link to="/workouts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Treinos
        </Link>
        <GlassCard className="text-center py-16">
          <h2 className="text-2xl font-display font-bold">Dia de descanso</h2>
          <p className="text-muted-foreground mt-2">Recupere para evoluir mais.</p>
          <div className="mt-4 flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setCatalogOpen(true)}
              className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2"
            >
              <Plus className="size-4" /> Adicionar do catálogo
            </button>
            <button
              onClick={() => setReplaceOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-primary/40 text-primary font-semibold inline-flex items-center gap-2 hover:bg-primary/10"
            >
              <Sparkles className="size-4" /> Gerar treino
            </button>
          </div>
        </GlassCard>
        {catalogOpen && (
          <ExerciseCatalog
            onClose={() => setCatalogOpen(false)}
            onPick={(entry) => {
              actions.addExercise(dayKey, {
                name: entry.name,
                muscle: entry.category,
                sets: entry.defaultSets,
                reps: entry.defaultReps,
                rest: entry.defaultRest,
              });
              toast.success(`${entry.name} adicionado`);
            }}
          />
        )}
        <AnimatePresence>
          {replaceOpen && (
            <ReplaceWorkoutModal
              onClose={() => setReplaceOpen(false)}
              onConfirm={(exercises, focus) => {
                actions.updateDay(dayKey, { exercises, focus, title: `Treino de ${label}` });
                setReplaceOpen(false);
                toast.success("Treino gerado!");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const completed = dayPlan.exercises.filter((e) => e.done).length;
  const total = dayPlan.exercises.length;

  async function logSet(ex: Exercise) {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("exercise_logs").insert({
        user_id: u.user.id,
        exercise_id: ex.id,
        exercise_name: ex.name,
        day_key: dayKey,
        weight: ex.weight ?? null,
        sets: ex.sets,
        reps: ex.reps,
      });
    } catch (e) {
      console.error(e);
    }
  }

  function finish() {
    actions.logSession(dayKey, completed, total);
    dayPlan!.exercises.filter((e) => e.done).forEach(logSet);
    toast.success("Treino registrado!", { description: `${completed}/${total} exercícios` });
  }

  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    actions.reorderExercise(dayKey, dragIdx, targetIdx);
    setDragIdx(null);
  }

  return (
    <div className="space-y-6 pb-6">
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <GlassCard className="relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-64 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">{label}</p>
            <h1 className="text-4xl font-display font-bold tracking-tight mt-1">{dayPlan.title}</h1>
            <p className="text-muted-foreground mt-1">
              Foco em {dayPlan.focus}
              {dayPlan.customized && (
                <span className="ml-2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Editado
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setReplaceOpen(true)}
              className="min-h-11 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 bg-background border border-border hover:bg-muted transition"
            >
              <Sparkles className="size-4 text-primary" /> Substituir
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className={`min-h-11 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition shadow-sm cursor-pointer relative z-10 ${
                editing
                  ? "gradient-primary text-primary-foreground"
                  : "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
              }`}
            >
              {editing ? <><Save className="size-4" /> Concluir</> : <><Pencil className="size-4" /> Editar treino</>}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completed / total) * 100}%` }}
              className="h-full gradient-primary"
            />
          </div>
          <span className="text-sm font-bold">{completed}/{total}</span>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Timer className="size-4 text-primary" />
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Cronômetro de descanso</p>
        </div>
        <RestTimerPresets />
      </GlassCard>

      {/* ─── Workout Extras: Mobilidade, Cardio, Abdômen ─── */}
      <div className="grid sm:grid-cols-3 gap-3">
        <WorkoutExtraSection
          icon={Activity}
          title="Mobilidade"
          color="text-purple-500"
          bgColor="bg-purple-500/10"
          borderColor="border-purple-500/20"
          exercises={[
            "Rotação de ombros 30s",
            "Alongamento de quadríceps 30s cada",
            "Mobilidade de tornozelo 30s cada",
          ]}
        />
        <WorkoutExtraSection
          icon={Heart}
          title="Cardio"
          color="text-red-500"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/20"
          exercises={[
            "Polichinelo 3x30s",
            "Corrida estacionária 3x45s",
            "Burpees 3x10",
          ]}
        />
        <WorkoutExtraSection
          icon={Wind}
          title="Abdômen"
          color="text-amber-500"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/20"
          exercises={[
            "Prancha 3x30s",
            "Abdominal supra 3x15",
            "Elevação de pernas 3x12",
          ]}
        />
      </div>

      <div className="space-y-3">
        {dayPlan.exercises.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            draggable={editing}
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => editing && e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDragIdx(null)}
            className={`glass rounded-2xl p-4 transition ${ex.done ? "opacity-70" : ""} ${
              dragIdx === i ? "opacity-50 scale-[0.98]" : ""
            } ${editing ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <div className="flex items-center gap-3">
              {editing && (
                <span className="text-muted-foreground shrink-0" aria-label="Arrastar">
                  <GripVertical className="size-5" />
                </span>
              )}
              <button
                onClick={() => actions.toggleExercise(dayKey, ex.id)}
                className={`size-12 shrink-0 rounded-xl grid place-items-center transition ${
                  ex.done ? "gradient-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}
                aria-label={ex.done ? "Marcar como não feito" : "Marcar como feito"}
              >
                {ex.done ? <Check className="size-5" /> : <Dumbbell className="size-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-semibold truncate ${ex.done ? "line-through" : ""}`}>{ex.name}</p>
                  <button
                    onClick={() => toggleVideo(ex.id)}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition ${
                      openVideoIds.has(ex.id)
                        ? "gradient-primary text-primary-foreground"
                        : "bg-primary/15 text-primary hover:bg-primary/25"
                    }`}
                    aria-label="Ver execução"
                    aria-expanded={openVideoIds.has(ex.id)}
                  >
                    <PlayCircle className="size-3.5" />
                    {openVideoIds.has(ex.id) ? "Ocultar vídeo" : "Ver execução"}
                  </button>
                  <button
                    onClick={() => setDetailFor(ex.name)}
                    className="text-muted-foreground hover:text-primary transition"
                    aria-label="Detalhes do exercício"
                  >
                    <Info className="size-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{ex.muscle}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditEx(ex)}
                      className="min-h-9 min-w-9 grid place-items-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer"
                      aria-label="Editar exercício"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        actions.removeExercise(dayKey, ex.id);
                        toast.success("Exercício removido");
                      }}
                      className="min-h-9 min-w-9 grid place-items-center rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 cursor-pointer"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="kg"
                      value={ex.weight ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(",", ".");
                        const n = v === "" ? undefined : Number(v);
                        actions.updateExercise(dayKey, ex.id, {
                          weight: Number.isFinite(n) ? n : undefined,
                        });
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                      aria-label="Peso usado em kg"
                    />
                    <button
                      onClick={() => {
                        const secs = parseInt(ex.rest) || 60;
                        startTimer(secs);
                        toast.success(`Descanso de ${secs}s iniciado`);
                      }}
                      className="min-h-9 px-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold inline-flex items-center justify-center gap-1 hover:bg-primary/20"
                    >
                      <Timer className="size-3" /> Iniciar
                    </button>
                  </>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {openVideoIds.has(ex.id) && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <InlineExerciseVideo
                    name={ex.name}
                    videoUrl={ex.videoUrl}
                    customTips={ex.customTips}
                    customMistakes={ex.customMistakes}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs pl-1">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Repeat className="size-3" />
                <span className="font-semibold text-foreground">{ex.sets}x{ex.reps}</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" />
                <span className="font-semibold text-foreground">{ex.rest}</span>
              </span>
              {ex.weight != null && (
                <span className="text-primary font-bold">{ex.weight} kg</span>
              )}
            </div>
          </motion.div>
        ))}

        {editing && (
          <button
            onClick={() => setCatalogOpen(true)}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-[var(--shadow-elegant)] cursor-pointer"
          >
            <Plus className="size-4" /> Adicionar exercício
          </button>
        )}
      </div>

      <button
        onClick={finish}
        className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] flex items-center justify-center gap-2 hover:scale-[1.01] transition"
      >
        <Trophy className="size-5" /> Finalizar treino
      </button>

      {detailFor && <ExerciseDetail name={detailFor} onClose={() => setDetailFor(null)} />}
      {catalogOpen && (
        <ExerciseCatalog
          onClose={() => setCatalogOpen(false)}
          onPick={(entry) => {
            actions.addExercise(dayKey, {
              name: entry.name,
              muscle: entry.category,
              sets: entry.defaultSets,
              reps: entry.defaultReps,
              rest: entry.defaultRest,
            });
            toast.success(`${entry.name} adicionado`);
          }}
        />
      )}
      <AnimatePresence>
        {editEx && (
          <EditExerciseModal
            ex={editEx}
            onClose={() => setEditEx(null)}
            onSave={(patch) => {
              actions.updateExercise(dayKey, editEx.id, patch);
              setEditEx(null);
              toast.success("Exercício atualizado");
            }}
          />
        )}
        {replaceOpen && (
          <ReplaceWorkoutModal
            onClose={() => setReplaceOpen(false)}
            onConfirm={(exercises, focus) => {
              actions.updateDay(dayKey, { exercises, focus });
              setReplaceOpen(false);
              toast.success("Treino substituído!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditExerciseModal({
  ex,
  onClose,
  onSave,
}: {
  ex: Exercise;
  onClose: () => void;
  onSave: (patch: Partial<Exercise>) => void;
}) {
  const [name, setName] = useState(ex.name);
  const [sets, setSets] = useState(String(ex.sets));
  const [reps, setReps] = useState(ex.reps);
  const [rest, setRest] = useState(ex.rest);
  const [weight, setWeight] = useState(ex.weight != null ? String(ex.weight) : "");
  const [videoUrl, setVideoUrl] = useState(ex.videoUrl ?? "");
  const [tipsText, setTipsText] = useState((ex.customTips ?? []).join("\n"));
  const [mistakesText, setMistakesText] = useState((ex.customMistakes ?? []).join("\n"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-display font-bold">Editar exercício</h2>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-muted/40"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Nome">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Séries">
              <input
                type="text"
                inputMode="numeric"
                value={sets}
                onChange={(e) => setSets(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Repetições">
              <input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Descanso">
              <input
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Carga (kg)">
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(",", "."))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
          </div>
          <Field label="Vídeo (URL do YouTube ou arquivo .mp4)">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/... ou https://.../video.mp4"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <Field label="Dicas (uma por linha)">
            <textarea
              value={tipsText}
              onChange={(e) => setTipsText(e.target.value)}
              rows={3}
              placeholder="Escápulas retraídas&#10;Punhos alinhados&#10;Respire na descida"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </Field>
          <Field label="Erros comuns (um por linha)">
            <textarea
              value={mistakesText}
              onChange={(e) => setMistakesText(e.target.value)}
              rows={3}
              placeholder="Quicar a barra no peito&#10;Levantar o quadril"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              const n = weight === "" ? undefined : Number(weight);
              const parseLines = (s: string) =>
                s.split("\n").map((l) => l.trim()).filter(Boolean);
              onSave({
                name: name.trim() || ex.name,
                sets: Math.max(1, Number(sets) || ex.sets),
                reps: reps.trim() || ex.reps,
                rest: rest.trim() || ex.rest,
                weight: Number.isFinite(n) ? n : undefined,
                videoUrl: videoUrl.trim() || undefined,
                customTips: parseLines(tipsText),
                customMistakes: parseLines(mistakesText),
              });
            }}
            className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold cursor-pointer"
          >
            Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MUSCLE_OPTIONS: { key: string; label: string }[] = [
  { key: "peito", label: "Peito" },
  { key: "costas", label: "Costas" },
  { key: "pernas", label: "Pernas" },
  { key: "ombros", label: "Ombros" },
  { key: "bracos", label: "Braços" },
  { key: "core", label: "Core" },
];

function ReplaceWorkoutModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (exercises: Exercise[], focus: string) => void;
}) {
  const [goal, setGoal] = useState<GenGoal>("hypertrophy");
  const [level, setLevel] = useState<GenLevel>("intermediate");
  const [muscles, setMuscles] = useState<string[]>(["peito", "bracos"]);
  const [duration, setDuration] = useState<number>(60);
  const [confirming, setConfirming] = useState(false);

  function toggleMuscle(k: string) {
    setMuscles((prev) => (prev.includes(k) ? prev.filter((m) => m !== k) : [...prev, k]));
  }

  function handleGenerate() {
    if (muscles.length === 0) {
      toast.error("Selecione ao menos um grupo muscular");
      return;
    }
    const exercises = generateDayExercises({ goal, level, muscles, durationMin: duration });
    const focus = muscles.map((k) => MUSCLE_OPTIONS.find((m) => m.key === k)?.label).join(", ");
    onConfirm(exercises, focus);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Gerar novo</p>
            <h2 className="text-2xl font-display font-bold">Substituir treino</h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-muted/40"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        <Field label="Objetivo">
          <div className="grid grid-cols-2 gap-2">
            {([
              ["hypertrophy", "Hipertrofia"],
              ["fat_loss", "Emagrecimento"],
              ["strength", "Força"],
              ["endurance", "Resistência"],
            ] as [GenGoal, string][]).map(([k, lbl]) => (
              <Chip key={k} active={goal === k} onClick={() => setGoal(k)}>
                {lbl}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Grupos musculares">
          <div className="flex flex-wrap gap-2">
            {MUSCLE_OPTIONS.map((m) => (
              <Chip key={m.key} active={muscles.includes(m.key)} onClick={() => toggleMuscle(m.key)}>
                {m.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Nível">
          <div className="grid grid-cols-3 gap-2">
            {([
              ["beginner", "Iniciante"],
              ["intermediate", "Intermediário"],
              ["advanced", "Avançado"],
            ] as [GenLevel, string][]).map(([k, lbl]) => (
              <Chip key={k} active={level === k} onClick={() => setLevel(k)}>
                {lbl}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Duração (min)">
          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 60, 90].map((d) => (
              <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </Field>

        {!confirming ? (
          <div className="mt-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="size-4" /> Gerar treino
            </button>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
            <p className="text-sm font-semibold mb-3">
              Isso vai substituir todos os exercícios. Continuar?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-lg bg-muted text-foreground font-semibold text-sm"
              >
                Voltar
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm"
              >
                Sim, substituir
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
        active
          ? "gradient-primary text-primary-foreground border-transparent shadow-sm"
          : "bg-background border-border text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Workout Extra Section (Mobilidade / Cardio / Abdômen) ─── */
function WorkoutExtraSection({
  icon: Icon,
  title,
  color,
  bgColor,
  borderColor,
  exercises,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  exercises: string[];
}) {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  return (
    <GlassCard className={`p-4 border-l-2 ${borderColor} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`size-8 rounded-lg ${bgColor} grid place-items-center`}>
            <Icon className={`size-4 ${color}`} />
          </div>
          <p className="font-display font-bold text-sm">{title}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setHidden((v) => !v)}
            className="size-7 rounded-md hover:bg-muted/40 grid place-items-center transition cursor-pointer"
            title={hidden ? "Mostrar" : "Ocultar"}
          >
            {hidden ? <EyeOff className="size-3.5 text-muted-foreground" /> : <Eye className="size-3.5 text-muted-foreground" />}
          </button>
          <button
            onClick={() => setRemoved(true)}
            className="size-7 rounded-md hover:bg-destructive/10 grid place-items-center transition cursor-pointer"
            title="Remover"
          >
            <Trash2 className="size-3.5 text-destructive/70" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!hidden && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 overflow-hidden"
          >
            {exercises.map((ex, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`size-1.5 rounded-full ${color.replace("text", "bg")}`} />
                {ex}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
