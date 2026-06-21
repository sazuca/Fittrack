import { motion } from "framer-motion";
import { X, PlayCircle, Lightbulb, AlertTriangle, Target, ExternalLink } from "lucide-react";
import { getExerciseInfo } from "@/lib/exercise-library";
import { EXERCISE_VIDEOS, getExerciseWatchUrl } from "@/data/exercise-videos";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findVideo(name: string) {
  const target = normalize(name);
  return EXERCISE_VIDEOS.find((v) => target.includes(normalize(v.name)) || normalize(v.name).includes(target));
}

function getYoutubeEmbedUrl(name: string): string {
  const found = findVideo(name);
  if (found?.youtubeVideoId)
    return `https://www.youtube.com/embed/${found.youtubeVideoId}`;
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    name + " execução correta"
  )}`;
}

export function ExerciseDetail({ name, onClose }: { name: string; onClose: () => void }) {
  const info = getExerciseInfo(name);
  const found = findVideo(name);
  const hasVideo = !!found?.youtubeVideoId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Exercício</p>
            <h2 className="text-2xl font-display font-bold tracking-tight">{info.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-muted/40 transition"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {hasVideo && (
          <div className="mb-5 rounded-2xl overflow-hidden border border-glass-border bg-black/40 relative aspect-video">
            <iframe
              src={getYoutubeEmbedUrl(name)}
              title={`Vídeo de execução: ${info.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            {found && (
              <a
                href={getExerciseWatchUrl(found)}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm hover:bg-black/85 transition z-10"
              >
                <ExternalLink className="size-3" />
                YouTube
              </a>
            )}
          </div>
        )}

        <Section icon={Target} title="Músculos trabalhados">
          <div className="flex flex-wrap gap-2">
            {info.muscles.map((m) => (
              <span key={m} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {m}
              </span>
            ))}
          </div>
        </Section>

        <Section icon={PlayCircle} title="Como executar">
          <ol className="space-y-2 list-decimal pl-5 text-sm">
            {info.instructions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>

        <Section icon={Lightbulb} title="Dicas de postura">
          <ul className="space-y-1.5 text-sm">
            {info.tips.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">•</span>{s}</li>
            ))}
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="Erros comuns">
          <ul className="space-y-1.5 text-sm">
            {info.mistakes.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-destructive">•</span>{s}</li>
            ))}
          </ul>
        </Section>
      </motion.div>
    </motion.div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-display font-bold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}
