import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Ruler, X, Trash2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/GlassCard";
import { BodyAnalysis } from "@/components/BodyAnalysis";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/measurements")({
  component: MeasurementsPage,
});

type Measurement = {
  id: string;
  measured_at: string;
  weight: number | null;
  height: number | null;
  waist: number | null;
  abdomen: number | null;
  hip: number | null;
  chest: number | null;
  arm_left: number | null;
  arm_right: number | null;
  thigh_left: number | null;
  thigh_right: number | null;
  calf_left: number | null;
  calf_right: number | null;
  notes: string | null;
};

const FIELDS: { key: keyof Measurement; label: string; unit: string }[] = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "height", label: "Altura", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "abdomen", label: "Abdômen", unit: "cm" },
  { key: "hip", label: "Quadril", unit: "cm" },
  { key: "chest", label: "Tórax/Peito", unit: "cm" },
  { key: "arm_left", label: "Braço Esq.", unit: "cm" },
  { key: "arm_right", label: "Braço Dir.", unit: "cm" },
  { key: "thigh_left", label: "Coxa Esq.", unit: "cm" },
  { key: "thigh_right", label: "Coxa Dir.", unit: "cm" },
  { key: "calf_left", label: "Panturrilha Esq.", unit: "cm" },
  { key: "calf_right", label: "Panturrilha Dir.", unit: "cm" },
];

function MeasurementsPage() {
  const profile = useAppState((s) => s.profile);
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("*")
        .order("measured_at", { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as Measurement[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar medidas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Remover este registro?")) return;
    const { error } = await supabase.from("body_measurements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Registro removido");
    setItems((p) => p.filter((x) => x.id !== id));
  }

  const chartData = [...items]
    .filter((m) => m.weight != null || m.waist != null)
    .reverse()
    .map((m) => ({
      date: new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      Peso: m.weight != null ? Number(m.weight) : null,
      Cintura: m.waist != null ? Number(m.waist) : null,
    }));

  const latest = items[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Evolução Corporal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre suas medidas e acompanhe a evolução ao longo do tempo.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition"
        >
          <Plus className="size-4" /> Registrar Novas Medidas
        </button>
      </div>

      <BodyAnalysis
        metrics={{
          weight: latest?.weight,
          height: latest?.height ?? profile?.height,
          waist: latest?.waist,
          abdomen: latest?.abdomen,
          hip: latest?.hip,
          chest: latest?.chest,
          armLeft: latest?.arm_left,
          armRight: latest?.arm_right,
          thighLeft: latest?.thigh_left,
          thighRight: latest?.thigh_right,
          calfLeft: latest?.calf_left,
          calfRight: latest?.calf_right,
          age: profile?.age,
          gender: profile?.gender,
          goal: profile?.goal,
        }}
      />

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold">Evolução de Peso e Cintura</h2>
            <p className="text-xs text-muted-foreground">Linha do tempo dos seus principais marcadores</p>
          </div>
          <Ruler className="size-5 text-primary" />
        </div>
        {chartData.length === 0 ? (
          <div className="h-64 grid place-items-center text-sm text-muted-foreground">
            Nenhum registro ainda. Adicione o primeiro para visualizar.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="date" fontSize={11} stroke="currentColor" />
                <YAxis fontSize={11} stroke="currentColor" domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Peso"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--primary)" }}
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Cintura"
                  stroke="var(--primary-glow)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--primary-glow)" }}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h2 className="font-display font-semibold">Histórico</h2>
          <p className="text-xs text-muted-foreground">Ordenado do mais recente para o mais antigo</p>
        </div>
        {loading ? (
          <div className="p-10 grid place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Sem registros — clique em "Registrar Novas Medidas".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-right px-3 py-3">Peso</th>
                  <th className="text-right px-3 py-3">Cintura</th>
                  <th className="text-right px-3 py-3">Abdômen</th>
                  <th className="text-right px-3 py-3">Quadril</th>
                  <th className="text-right px-3 py-3">Tórax</th>
                  <th className="text-right px-3 py-3">Braço E/D</th>
                  <th className="text-right px-3 py-3">Coxa E/D</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-t border-glass-border hover:bg-muted/20 transition">
                    <td className="px-4 py-3 font-medium">
                      {new Date(m.measured_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-3 text-right">{fmt(m.weight, "kg")}</td>
                    <td className="px-3 py-3 text-right">{fmt(m.waist)}</td>
                    <td className="px-3 py-3 text-right">{fmt(m.abdomen)}</td>
                    <td className="px-3 py-3 text-right">{fmt(m.hip)}</td>
                    <td className="px-3 py-3 text-right">{fmt(m.chest)}</td>
                    <td className="px-3 py-3 text-right text-xs">
                      {fmt(m.arm_left)} / {fmt(m.arm_right)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs">
                      {fmt(m.thigh_left)} / {fmt(m.thigh_right)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => remove(m.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {open && (
          <MeasurementModal
            defaultHeight={profile?.height}
            onClose={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function fmt(v: number | null, unit = "") {
  if (v == null) return "—";
  return `${Number(v).toFixed(1)}${unit ? " " + unit : ""}`;
}

function MeasurementModal({
  defaultHeight,
  onClose,
  onSaved,
}: {
  defaultHeight?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<Record<string, string>>({
    height: defaultHeight ? String(defaultHeight) : "",
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData, error: uerr } = await supabase.auth.getUser();
    if (uerr || !userData.user) {
      toast.error("Faça login novamente.");
      setSaving(false);
      return;
    }
    const payload: Record<string, unknown> = {
      user_id: userData.user.id,
      measured_at: date,
    };
    for (const f of FIELDS) {
      const raw = values[f.key as string];
      if (raw && raw.trim() !== "") {
        const parsed = Number(raw.replace(",", "."));
        if (Number.isFinite(parsed)) payload[f.key as string] = parsed;
      }
    }
    const { error } = await supabase.from("body_measurements").insert(payload as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Medidas registradas!");
    onSaved();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl glass-strong rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold">Novas Medidas</h2>
            <p className="text-xs text-muted-foreground">Preencha o que tiver à mão</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/40 transition">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key as string}>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {f.label} ({f.unit})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={values[f.key as string] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.key as string]: e.target.value.replace(/[^0-9,.]/g, "") }))
                  }
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-glass-border hover:bg-muted/40 transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
