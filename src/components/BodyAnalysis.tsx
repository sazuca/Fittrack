import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Target,
  Activity,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BodyMetrics {
  weight?: number | null;
  height?: number | null;
  waist?: number | null;
  abdomen?: number | null;
  hip?: number | null;
  chest?: number | null;
  armLeft?: number | null;
  armRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  calfLeft?: number | null;
  calfRight?: number | null;
  age?: number;
  gender?: string;
  goal?: string;
}

interface Props {
  metrics: BodyMetrics;
}

export function BodyAnalysis({ metrics }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = Object.values(metrics).some((v) => v != null && v !== "");

  async function analyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const prompt = buildPrompt(metrics);

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:1b",
          prompt,
          system: "Você é um assessor esportivo especializado em análise corporal. Responda APENAS com a análise solicitada, em português brasileiro, de forma clara e direta. Não use formatação markdown nem caracteres especiais.",
          stream: false,
          options: { temperature: 0.3, num_predict: 512 },
        }),
      });

      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

      const data = await res.json();
      setAnalysis(data.response?.trim() || "Nenhuma análise gerada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg);
      toast.error("Não foi possível conectar ao Ollama. Verifique se ele está rodando em http://localhost:11434");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-60 rounded-full bg-gradient-to-br from-primary/5 to-purple-500/5 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 grid place-items-center shadow-[var(--shadow-glow)]">
              <Brain className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Análise com IA</h2>
              <p className="text-xs text-muted-foreground">Use IA local (Ollama) para analisar suas medidas</p>
            </div>
          </div>

          {analysis && (
            <button
              onClick={() => { setAnalysis(null); analyze(); }}
              disabled={loading}
              className="size-10 rounded-xl bg-muted hover:bg-accent grid place-items-center transition shrink-0"
              title="Gerar nova análise"
            >
              <RefreshCw className="size-4" />
            </button>
          )}
        </div>

        {!hasData && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <Activity className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p>Registre suas medidas primeiro para gerar uma análise.</p>
          </div>
        )}

        {hasData && !analysis && !loading && !error && (
          <Button
            onClick={analyze}
            className="w-full cursor-pointer gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground py-6 text-base"
          >
            <Sparkles className="size-5" />
            Analisar Minhas Medidas com IA
          </Button>
        )}

        {loading && (
          <div className="p-8 text-center space-y-3">
            <motion.div
              className="size-16 rounded-full bg-gradient-to-br from-primary to-purple-600 grid place-items-center mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Loader2 className="size-7 text-primary-foreground animate-spin" />
            </motion.div>
            <p className="font-semibold">Analisando suas medidas...</p>
            <p className="text-xs text-muted-foreground">Consultando IA local (Ollama)</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-sm space-y-2">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangle className="size-4" />
              Erro de conexão
            </div>
            <p className="text-muted-foreground text-xs">
              Não foi possível conectar ao Ollama. Verifique:
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              <li>Ollama está rodando? Execute <code className="px-1 py-0.5 rounded bg-muted">ollama serve</code></li>
              <li>O modelo <strong>gemma3:1b</strong> está instalado? Execute <code className="px-1 py-0.5 rounded bg-muted">ollama pull gemma3:1b</code></li>
              <li>A API está acessível em <code className="px-1 py-0.5 rounded bg-muted">http://localhost:11434</code></li>
            </ul>
            <Button variant="outline" onClick={analyze} className="mt-2 cursor-pointer gap-2" size="sm">
              <RefreshCw className="size-3" /> Tentar novamente
            </Button>
          </div>
        )}

        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="size-4 text-primary" />
                <h3 className="font-semibold text-sm">Resultado da Análise</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {analysis}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="size-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Dados utilizados</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics).map(([key, val]) => {
                  if (val == null || val === "") return null;
                  const label = ({
                    weight: "Peso", height: "Altura", waist: "Cintura",
                    abdomen: "Abdômen", hip: "Quadril", chest: "Tórax",
                    armLeft: "Braço E", armRight: "Braço D",
                    thighLeft: "Coxa E", thighRight: "Coxa D",
                    calfLeft: "Pant E", calfRight: "Pant D",
                    age: "Idade", gender: "Gênero", goal: "Objetivo",
                  } as Record<string, string>)[key] || key;
                  return (
                    <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-medium">
                      {label}: {val}{key === "weight" ? " kg" : key === "height" ? " cm" : !["age", "gender", "goal"].includes(key) ? " cm" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

function buildPrompt(metrics: BodyMetrics): string {
  const parts: string[] = ["Analise as seguintes medidas corporais de um aluno:"];
  if (metrics.age) parts.push(`Idade: ${metrics.age} anos`);
  if (metrics.gender) parts.push(`Gênero: ${metrics.gender === "male" ? "Masculino" : metrics.gender === "female" ? "Feminino" : metrics.gender}`);
  if (metrics.goal) {
    const goalLabel: Record<string, string> = { hypertrophy: "Hipertrofia", fat_loss: "Perda de gordura", endurance: "Resistência", strength: "Força", general: "Condicionamento geral" };
    parts.push(`Objetivo: ${goalLabel[metrics.goal] || metrics.goal}`);
  }
  if (metrics.weight) parts.push(`Peso: ${metrics.weight} kg`);
  if (metrics.height) parts.push(`Altura: ${metrics.height} cm`);
  if (metrics.waist) parts.push(`Cintura: ${metrics.waist} cm`);
  if (metrics.abdomen) parts.push(`Abdômen: ${metrics.abdomen} cm`);
  if (metrics.hip) parts.push(`Quadril: ${metrics.hip} cm`);
  if (metrics.chest) parts.push(`Tórax: ${metrics.chest} cm`);
  if (metrics.armLeft) parts.push(`Braço esquerdo: ${metrics.armLeft} cm`);
  if (metrics.armRight) parts.push(`Braço direito: ${metrics.armRight} cm`);
  if (metrics.thighLeft) parts.push(`Coxa esquerda: ${metrics.thighLeft} cm`);
  if (metrics.thighRight) parts.push(`Coxa direita: ${metrics.thighRight} cm`);
  if (metrics.calfLeft) parts.push(`Panturrilha esquerda: ${metrics.calfLeft} cm`);
  if (metrics.calfRight) parts.push(`Panturrilha direita: ${metrics.calfRight} cm`);

  parts.push("");
  parts.push("Com base nessas medidas, forneça:");
  parts.push("1. Uma avaliação geral da composição corporal");
  parts.push("2. Pontos fortes e pontos a melhorar");
  parts.push("3. Recomendações de treino baseadas no objetivo");
  parts.push("4. Sugestões de acompanhamento");

  return parts.join("\n");
}
