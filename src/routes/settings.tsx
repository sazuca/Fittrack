import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Moon, User } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { actions, useAppState, type Profile } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const profile = useAppState((s) => s.profile);
  const dark = useAppState((s) => s.darkMode);
  const notif = useAppState((s) => s.notifications);

  if (!profile) return null;

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    actions.updateProfile({ [key]: value } as Partial<Profile>);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Edite seu perfil e preferências</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <User className="size-4 text-primary" />
          <h2 className="font-display font-bold">Perfil</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome" value={profile.name} onChange={(v) => update("name", v)} />
          <Field label="Email" value={profile.email} onChange={(v) => update("email", v)} />
          <NumberField
            label="Peso (kg)"
            value={profile.weight}
            onChange={(v) => update("weight", v)}
          />
          <NumberField
            label="Altura (cm)"
            value={profile.height}
            onChange={(v) => update("height", v)}
          />
          <NumberField label="Idade" value={profile.age} onChange={(v) => update("age", v)} />
          <NumberField
            label="Dias/semana"
            value={profile.daysPerWeek}
            onChange={(v) => update("daysPerWeek", Math.min(7, Math.max(1, v)))}
          />
        </div>
        <button
          onClick={() => toast.success("Perfil salvo!")}
          className="mt-5 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold"
        >
          Salvar alterações
        </button>
      </GlassCard>

      <GlassCard>
        <h2 className="font-display font-bold mb-4">Preferências</h2>
        <Toggle
          icon={Moon}
          label="Modo escuro"
          desc="Tema dark com acentos premium"
          value={dark}
          onChange={actions.setDarkMode}
        />
        <Toggle
          icon={Bell}
          label="Notificações"
          desc="Lembretes de treino e progresso"
          value={notif}
          onChange={actions.setNotifications}
        />
      </GlassCard>

      <GlassCard className="border-destructive/20">
        <h2 className="font-display font-bold mb-2">Conta</h2>
        <p className="text-sm text-muted-foreground mb-4">Encerre sua sessão a qualquer momento</p>
        <button
          onClick={actions.signOut}
          className="px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20"
        >
          Sair da conta
        </button>
      </GlassCard>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
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
        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function Toggle({
  icon: Icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition ${
          value ? "gradient-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
