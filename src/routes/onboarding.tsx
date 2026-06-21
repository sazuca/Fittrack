import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { actions, type Profile, useAppState } from "@/lib/store";
import { generatePlan } from "@/lib/ai-workout";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const STEPS = ["Você", "Corpo", "Experiência", "Treino", "Objetivo"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const existing = useAppState((s) => s.profile);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Profile>>({
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    gender: "male",
    age: 25,
    weight: 75,
    height: 175,
    level: "beginner",
    experienceYears: 0,
    daysPerWeek: 4,
    minutesPerSession: 60,
    goal: "hypertrophy",
  });

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }
  function finish() {
    const profile = data as Profile;
    const plan = generatePlan(profile);
    actions.completeOnboarding(profile, plan);
    toast.success("Plano de treinos gerado pela IA!");
    navigate({ to: "/dashboard" });
  }

  const update = (p: Partial<Profile>) => setData((d) => ({ ...d, ...p }));

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i <= step ? "gradient-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-strong rounded-3xl p-8"
        >
          <p className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-2">
            <Sparkles className="size-3" /> Passo {step + 1} de {STEPS.length}
          </p>
          <h2 className="text-3xl font-display font-bold tracking-tight mt-2">{STEPS[step]}</h2>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepWrap key="0">
                  <Input label="Nome" value={data.name ?? ""} onChange={(v) => update({ name: v })} />
                  <Input label="Email" value={data.email ?? ""} onChange={(v) => update({ email: v })} />
                  <Select
                    label="Gênero"
                    value={data.gender!}
                    onChange={(v) => update({ gender: v as Profile["gender"] })}
                    options={[
                      { v: "male", l: "Masculino" },
                      { v: "female", l: "Feminino" },
                      { v: "other", l: "Outro" },
                    ]}
                  />
                </StepWrap>
              )}
              {step === 1 && (
                <StepWrap key="1">
                  <NumberField label="Idade" value={data.age!} onChange={(v) => update({ age: v })} suffix="anos" />
                  <NumberField label="Peso" value={data.weight!} onChange={(v) => update({ weight: v })} suffix="kg" />
                  <NumberField label="Altura" value={data.height!} onChange={(v) => update({ height: v })} suffix="cm" />
                </StepWrap>
              )}
              {step === 2 && (
                <StepWrap key="2">
                  <Cards
                    label="Nível atual"
                    value={data.level!}
                    onChange={(v) => update({ level: v as Profile["level"] })}
                    options={[
                      { v: "beginner", l: "Iniciante", d: "0-1 ano" },
                      { v: "intermediate", l: "Intermediário", d: "1-3 anos" },
                      { v: "advanced", l: "Avançado", d: "3+ anos" },
                    ]}
                  />
                  <NumberField
                    label="Experiência na academia"
                    value={data.experienceYears!}
                    onChange={(v) => update({ experienceYears: v })}
                    suffix="anos"
                  />
                </StepWrap>
              )}
              {step === 3 && (
                <StepWrap key="3">
                  <NumberField
                    label="Dias por semana"
                    value={data.daysPerWeek!}
                    onChange={(v) => update({ daysPerWeek: Math.max(1, Math.min(7, v)) })}
                    suffix="dias"
                  />
                  <NumberField
                    label="Minutos por treino"
                    value={data.minutesPerSession!}
                    onChange={(v) => update({ minutesPerSession: v })}
                    suffix="min"
                  />
                </StepWrap>
              )}
              {step === 4 && (
                <StepWrap key="4">
                  <Cards
                    label="Foco principal"
                    value={data.goal!}
                    onChange={(v) => update({ goal: v as Profile["goal"] })}
                    options={[
                      { v: "hypertrophy", l: "Hipertrofia", d: "Ganho de massa" },
                      { v: "fat_loss", l: "Emagrecimento", d: "Perda de gordura" },
                      { v: "strength", l: "Força", d: "Aumentar carga" },
                      { v: "endurance", l: "Resistência", d: "Cardio + reps" },
                      { v: "general", l: "Saúde geral", d: "Bem-estar" },
                    ]}
                  />
                </StepWrap>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="px-5 py-2.5 rounded-xl glass font-medium flex items-center gap-2 disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] flex items-center gap-2 hover:scale-[1.02] transition"
            >
              {step === STEPS.length - 1 ? "Gerar plano" : "Continuar"}
              {step === STEPS.length - 1 ? <Sparkles className="size-4" /> : <ArrowRight className="size-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StepWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-4 py-3 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <EditableNumberInput value={value} onChange={onChange} className="mt-1" />
      {suffix && (
        <span className="mt-1 block text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </label>
  );
}

function EditableNumberInput({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={(e) => {
        const next = e.target.value.replace(/[^0-9,.]/g, "");
        setDraft(next);
        const parsed = Number(next.replace(",", "."));
        if (next !== "" && Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => {
        const parsed = Number(draft.replace(",", "."));
        if (!draft || !Number.isFinite(parsed)) setDraft(String(value ?? ""));
      }}
      className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
    />
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2 flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            type="button"
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`px-4 py-2 rounded-xl border transition ${
              value === o.v
                ? "gradient-primary text-primary-foreground border-transparent"
                : "glass border-glass-border"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </label>
  );
}

function Cards({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string; d: string }[];
}) {
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2 grid sm:grid-cols-2 gap-3">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <button
              type="button"
              key={o.v}
              onClick={() => onChange(o.v)}
              className={`text-left p-4 rounded-2xl border transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-elegant)]"
                  : "glass border-glass-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{o.l}</p>
                  <p className={`text-xs ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {o.d}
                  </p>
                </div>
                {active && <Check className="size-4" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
