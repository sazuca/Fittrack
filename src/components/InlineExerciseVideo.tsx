import { Lightbulb, AlertTriangle, ListChecks, ExternalLink } from "lucide-react";
import { getExerciseInfo } from "@/lib/exercise-library";
import { EXERCISE_VIDEOS, getExerciseWatchUrl } from "@/data/exercise-videos";

/**
 * Player de execução de exercício — usa YouTube iframe embed.
 *
 * Busca o ID do vídeo do YouTube em EXERCISE_VIDEOS pelo nome do exercício.
 * Se `videoUrl` for passado (URL completa do YouTube), usa ele direto.
 * Fallback: busca genérica no YouTube.
 */
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

function getYoutubeEmbedUrl(name: string, videoUrl?: string): string {
  if (videoUrl && videoUrl.trim()) {
    const url = videoUrl.trim();
    if (url.includes("youtube.com/embed/")) return url;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  }
  const found = findVideo(name);
  if (found?.youtubeVideoId)
    return `https://www.youtube.com/embed/${found.youtubeVideoId}`;
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    name + " execução correta"
  )}`;
}

export function InlineExerciseVideo({
  name,
  videoUrl,
  customTips,
  customMistakes,
}: {
  name: string;
  videoUrl?: string;
  customTips?: string[];
  customMistakes?: string[];
}) {
  const info = getExerciseInfo(name);
  const tips = customTips && customTips.length ? customTips : info.tips;
  const mistakes = customMistakes && customMistakes.length ? customMistakes : info.mistakes;

  const found = findVideo(name);
  const hasVideo = !!found?.youtubeVideoId;

  return (
    <div className="mt-3 rounded-2xl border border-glass-border bg-black/40 overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
      {hasVideo && (
        <div className="relative bg-black aspect-video">
          <iframe
            src={getYoutubeEmbedUrl(name, videoUrl)}
            title={`Vídeo de execução: ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
          <a
            href={getExerciseWatchUrl(found!)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm hover:bg-black/85 transition z-10"
          >
            <ExternalLink className="size-3" />
            YouTube
          </a>
        </div>
      )}

      <div className="p-3 space-y-3 text-sm">
        <Block icon={ListChecks} title="Como executar" tone="primary">
          <ol className="list-decimal pl-5 space-y-1">
            {info.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Block>

        <div className="grid sm:grid-cols-2 gap-3">
          <Block icon={Lightbulb} title="Dicas" tone="primary">
            <ul className="space-y-1">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </Block>
          <Block icon={AlertTriangle} title="Erros comuns" tone="destructive">
            <ul className="space-y-1">
              {mistakes.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-destructive">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </Block>
        </div>
      </div>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: "primary" | "destructive";
  children: React.ReactNode;
}) {
  const toneClass = tone === "destructive" ? "text-destructive" : "text-primary";
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`size-3.5 ${toneClass}`} />
        <p className={`text-[10px] uppercase tracking-widest font-bold ${toneClass}`}>{title}</p>
      </div>
      <div className="text-xs text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}
