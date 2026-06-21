import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Plus, Loader2, X, Trash2, GitCompare,
  Sparkles, BrainCircuit, Activity, Heart,
  Target, Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/lib/store";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/photos")({
  component: PhotosPage,
});

type Photo = {
  id: string;
  taken_at: string;
  pose: "front" | "back" | "left" | "right";
  public_url: string;
  name: string;
};

const POSES: { value: Photo["pose"]; label: string }[] = [
  { value: "front", label: "Frente" },
  { value: "back", label: "Costas" },
  { value: "left", label: "Lado Esquerdo" },
  { value: "right", label: "Lado Direito" },
];

const poseLabel = (p: string) => POSES.find((x) => x.value === p)?.label ?? p;

function PhotosPage() {
  const userId = useAppState((s) => s.userId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [photoA, setPhotoA] = useState<string | null>(null);
  const [photoB, setPhotoB] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<{
    bodyFat: number;
    muscleMass: number;
    bmi: number;
    symmetry: number;
    tips: string[];
    scores: { label: string; value: number; color: string }[];
    progressData: { week: string; massa: number; gordura: number }[];
  } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .order("taken_at", { ascending: false });
      if (error) throw error;
      setPhotos((data ?? []).map((r) => ({
        id: r.id,
        taken_at: r.taken_at,
        pose: r.pose as Photo["pose"],
        public_url: r.public_url,
        name: `Foto ${poseLabel(r.pose)} - ${r.taken_at}`,
      })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível carregar fotos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(p: Photo) {
    if (!confirm("Remover esta foto?")) return;
    try {
      const { error: dbErr } = await supabase.from("progress_photos").delete().eq("id", p.id);
      if (dbErr) throw dbErr;
      if (userId && p.public_url) {
        const path = p.public_url.split("/").pop();
        if (path) {
          await supabase.storage.from("progress-photos").remove([`${userId}/${path}`]);
        }
      }
      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("Foto removida");
      if (photoA === p.id) setPhotoA(null);
      if (photoB === p.id) setPhotoB(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao remover foto");
    }
  }

  const a = useMemo(() => photos.find((p) => p.id === photoA) ?? null, [photos, photoA]);
  const b = useMemo(() => photos.find((p) => p.id === photoB) ?? null, [photos, photoB]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Fotos de Evolução</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documente sua jornada e compare antes e depois.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition"
        >
          <Plus className="size-4" /> Enviar Nova Foto
        </button>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="size-5 text-primary" />
          <div>
            <h2 className="font-display font-semibold">Antes e Depois</h2>
            <p className="text-xs text-muted-foreground">
              Selecione duas fotos para comparar lado a lado e use o slider.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <PhotoPicker label="Foto A (antes)" photos={photos} value={photoA} onChange={setPhotoA} />
          <PhotoPicker label="Foto B (depois)" photos={photos} value={photoB} onChange={setPhotoB} />
        </div>

        {a && b ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <PhotoTile photo={a} />
              <PhotoTile photo={b} />
            </div>
            <CompareSlider before={a.public_url} after={b.public_url} />
          </div>
        ) : (
          <div className="h-32 grid place-items-center text-sm text-muted-foreground border border-dashed border-glass-border rounded-xl">
            Selecione duas fotos acima para comparar.
          </div>
        )}
      </GlassCard>

      {photos.length >= 1 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="size-5 text-primary" />
            <div>
              <h2 className="font-display font-semibold">Análise por IA</h2>
              <p className="text-xs text-muted-foreground">
                Simule uma análise de composição corporal com inteligência artificial.
              </p>
            </div>
          </div>

          {aiReport ? (
            <AiReportCard report={aiReport} />
          ) : (
            <div className="text-center py-6">
              {aiAnalyzing ? (
                <div className="space-y-4">
                  <motion.div
                    className="size-20 rounded-full gradient-primary grid place-items-center mx-auto"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BrainCircuit className="size-8 text-primary-foreground" />
                  </motion.div>
                  <p className="font-display font-bold text-lg animate-pulse">IA analisando composição corporal...</p>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="size-2 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Escaneando pontos biométricos, simetria muscular e composição...
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAiAnalyzing(true);
                    setTimeout(() => {
                      setAiAnalyzing(false);
                      setAiReport({
                        bodyFat: 18.4,
                        muscleMass: 37.2,
                        bmi: 24.1,
                        symmetry: 82,
                        tips: [
                          "Foco em exercícios unilaterais para corrigir leve desvio de simetria nos ombros.",
                          "Aumente a ingestão proteica para 2g/kg para otimizar recuperação muscular.",
                          "Inclua treinos de mobilidade articular 2x/semana para prevenir lesões.",
                          "Seu percentual de gordura está saudável. Continue com o déficit calórico leve.",
                          "Priorize o sono de 7-9h — a recuperação noturna é crucial para a hipertrofia.",
                        ],
                        scores: [
                          { label: "Simetria", value: 82, color: "var(--primary)" },
                          { label: "Definição", value: 68, color: "var(--primary-glow)" },
                          { label: "Postura", value: 75, color: "var(--chart-3)" },
                          { label: "Volume Muscular", value: 70, color: "var(--chart-4)" },
                        ],
                        progressData: [
                          { week: "S-4", massa: 35.8, gordura: 20.1 },
                          { week: "S-3", massa: 36.3, gordura: 19.5 },
                          { week: "S-2", massa: 36.7, gordura: 19.0 },
                          { week: "S-1", massa: 37.0, gordura: 18.7 },
                          { week: "Atual", massa: 37.2, gordura: 18.4 },
                        ],
                      });
                      toast.success("Análise corporal concluída!");
                    }, 3000);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:scale-[1.02] transition"
                >
                  <Sparkles className="size-4" /> Analisar composição corporal
                </button>
              )}
            </div>
          )}

          {aiReport && (
            <button
              onClick={() => setAiReport(null)}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Limpar análise
            </button>
          )}
        </GlassCard>
      )}

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Camera className="size-5 text-primary" />
          <h2 className="font-display font-semibold">Galeria</h2>
        </div>
        {loading ? (
          <div className="p-10 grid place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma foto enviada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-2xl overflow-hidden border border-glass-border bg-muted/30"
              >
                <img
                  src={p.public_url}
                  alt={poseLabel(p.pose)}
                  className="w-full aspect-[3/4] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <p className="text-xs font-medium">{poseLabel(p.pose)}</p>
                  <p className="text-[10px] opacity-80">
                    {new Date(p.taken_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => remove(p)}
                  aria-label="Remover foto"
                  className="absolute top-2 right-2 min-h-11 min-w-11 grid place-items-center rounded-xl bg-black/60 backdrop-blur text-white hover:bg-destructive active:bg-destructive transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {uploadOpen && (
          <UploadModal
            onClose={() => setUploadOpen(false)}
            onSaved={() => {
              setUploadOpen(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotoTile({ photo }: { photo: Photo }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-glass-border">
      <img src={photo.public_url} alt="" className="w-full aspect-[3/4] object-cover" />
      <div className="p-2 text-center bg-muted/30">
        <p className="text-xs font-semibold">{poseLabel(photo.pose)}</p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(photo.taken_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

function PhotoPicker({
  label,
  photos,
  value,
  onChange,
}: {
  label: string;
  photos: Photo[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
      >
        <option value="">Selecionar...</option>
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {new Date(p.taken_at).toLocaleDateString("pt-BR")} — {poseLabel(p.pose)}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (ref.current) setContainerWidth(ref.current.clientWidth);
    const onResize = () => { if (ref.current) setContainerWidth(ref.current.clientWidth); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onMove(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Slider Comparativo</p>
      <div
        ref={ref}
        className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-glass-border select-none cursor-ew-resize"
        onMouseMove={(e) => e.buttons === 1 && onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onClick={(e) => onMove(e.clientX)}
      >
        <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pos}%` }}
        >
          <img
            src={before}
            alt="Antes"
            className="absolute inset-y-0 h-full object-cover"
            style={{ width: Math.max(containerWidth, 1), maxWidth: "none" }}
            draggable={false}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full bg-white shadow-xl grid place-items-center text-primary">
            <GitCompare className="size-4" />
          </div>
        </div>
        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-medium">
          ANTES
        </span>
        <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-medium">
          DEPOIS
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="w-full max-w-md mx-auto block accent-primary"
      />
    </div>
  );
}

/* ─── AI Report Card ─── */
function AiReportCard({
  report,
}: {
  report: {
    bodyFat: number;
    muscleMass: number;
    bmi: number;
    symmetry: number;
    tips: string[];
    scores: { label: string; value: number; color: string }[];
    progressData: { week: string; massa: number; gordura: number }[];
  };
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Activity} label="% Gordura" value={`${report.bodyFat}%`} trend="-1.7%" />
        <MiniStat icon={Dumbbell} label="Massa Muscular" value={`${report.muscleMass}kg`} trend="+1.4kg" />
        <MiniStat icon={Heart} label="IMC" value={`${report.bmi}`} trend="Saudável" />
        <MiniStat icon={Target} label="Simetria" value={`${report.symmetry}%`} trend="Boa" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Score Corporal</p>
        <div className="space-y-2">
          {report.scores.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{s.label}</span>
                <span className="font-bold" style={{ color: s.color }}>{s.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Evolução Estimada</p>
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={report.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="week" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="massa" name="Massa Muscular (kg)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gordura" name="% Gordura" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Dicas do Assistente IA</p>
        </div>
        <ol className="space-y-2">
          {report.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="text-primary font-bold shrink-0">{i + 1}.</span>
              {tip}
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
}) {
  const trendColor = trend.startsWith("+") ? "text-green-500" : trend.startsWith("-") ? "text-red-500" : "text-primary";
  return (
    <div className="p-4 rounded-2xl bg-card border border-border text-center">
      <Icon className="size-5 text-primary mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-display font-bold">{value}</p>
      <p className={`text-[10px] font-medium ${trendColor}`}>{trend}</p>
    </div>
  );
}

function UploadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const userId = useAppState((s) => s.userId);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [pose, setPose] = useState<Photo["pose"]>("front");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function pick(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Selecione uma imagem");
    if (!file.type.startsWith("image/")) return toast.error("Selecione um arquivo de imagem válido");
    if (!userId) return toast.error("Usuário não autenticado");
    setSaving(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `${userId}/${Date.now()}-${pose}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("progress-photos")
        .upload(storagePath, file, { contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("progress-photos").getPublicUrl(storagePath);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) throw new Error("Failed to get public URL");

      const { error: dbErr } = await supabase.from("progress_photos").insert({
        taken_at: date,
        pose,
        storage_path: storagePath,
        public_url: publicUrl,
      });

      if (dbErr) {
        await supabase.storage.from("progress-photos").remove([storagePath]);
        throw dbErr;
      }

      toast.success("Foto salva!");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar foto");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

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
        className="w-full max-w-md glass-strong rounded-3xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold">Nova Foto</h2>
            <p className="text-xs text-muted-foreground">Acompanhe sua evolução visual</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/40 transition">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Imagem
            </label>
            {preview ? (
              <div className="mt-1 relative rounded-xl overflow-hidden border border-glass-border">
                <img src={preview} alt="" className="w-full aspect-[3/4] object-cover" />
                <button
                  type="button"
                  onClick={() => pick(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center justify-center gap-2 px-4 py-10 rounded-xl border-2 border-dashed border-glass-border hover:bg-muted/30 cursor-pointer transition">
                <Camera className="size-6 text-primary" />
                <span className="text-sm font-medium">Clique para selecionar</span>
                <span className="text-xs text-muted-foreground">JPG, PNG ou WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pick(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ângulo
              </label>
              <select
                value={pose}
                onChange={(e) => setPose(e.target.value as Photo["pose"])}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              >
                {POSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
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
              disabled={saving || !file}
              className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />} Enviar Foto
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
