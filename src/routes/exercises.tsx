import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Search,
  X,
  Dumbbell,
  Target,
  Lightbulb,
  ChevronRight,
  Video,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import {
  EXERCISE_VIDEOS,
  VIDEO_CATEGORIES,
  filterByCategory,
  searchVideos,
  getExerciseVideoEmbedUrl,
  getExerciseThumbnailUrl,
} from "@/data/exercise-videos";
import type { MuscleCategory } from "@/lib/exercise-library";
import type { ExerciseVideo } from "@/data/exercise-videos";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Biblioteca de Exercícios — FitTrack" },
      {
        name: "description",
        content:
          "Vídeos de execução de exercícios com instruções e dicas de performance.",
      },
    ],
  }),
  component: ExercisesPage,
});

// =============================================================================
// Componente Principal
// =============================================================================

function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState<MuscleCategory | "Todos">("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  const filtered = useMemo(() => {
    let result = filterByCategory(EXERCISE_VIDEOS, activeCategory);
    if (searchQuery.trim()) {
      result = searchVideos(result, searchQuery);
    }
    return result;
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6 min-h-[80vh]">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
            <Video className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Biblioteca de Exercícios
            </h1>
            <p className="text-sm text-muted-foreground">
              Vídeos de execução com instruções e dicas de performance
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar exercício, músculo ou grupo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        <FilterChip
          label="Todos"
          active={activeCategory === "Todos"}
          onClick={() => setActiveCategory("Todos")}
          count={EXERCISE_VIDEOS.length}
        />
        {VIDEO_CATEGORIES.map((cat) => {
          const count = EXERCISE_VIDEOS.filter((v) => v.category === cat).length;
          if (count === 0) return null;
          return (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              count={count}
            />
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} exercício{filtered.length !== 1 ? "s" : ""} encontrado
        {filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "Todos" ? ` em ${activeCategory}` : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState onClear={() => { setSearchQuery(""); setActiveCategory("Todos"); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((video, index) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <ExerciseCard video={video} onPlay={() => setSelectedVideo(video)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Sub-componentes
// =============================================================================

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={
        `shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ` +
        (active
          ? `gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]`
          : `bg-card border border-border text-foreground hover:bg-accent hover:border-accent`)
      }
    >
      {label}
      <span
        className={
          `ml-1.5 text-xs px-1.5 py-0.5 rounded-md ` +
          (active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")
        }
      >
        {count}
      </span>
    </button>
  );
}

function ExerciseCard({
  video,
  onPlay,
}: {
  video: ExerciseVideo;
  onPlay: () => void;
}) {
  const hasVideo = !!video.youtubeVideoId;
  const thumbUrl = hasVideo ? getExerciseThumbnailUrl(video) : null;

  return (
    <GlassCard className="group p-0 overflow-hidden hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail / Video Preview — only for exercises with video */}
      {hasVideo && (
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img
            src={thumbUrl!}
            alt={`Miniatura do vídeo de ${video.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Play Button Overlay */}
          <button
            onClick={onPlay}
            className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label={`Assistir vídeo de ${video.name}`}
          >
            <div className="size-14 rounded-full gradient-primary grid place-items-center shadow-[var(--shadow-glow)] animate-pulse">
              <Play className="size-6 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white">
              {video.category}
            </span>
          </div>
        </div>
      )}

      {/* Category Badge — shown at top when no video thumbnail */}
      {!hasVideo && (
        <div className="p-4 pb-0">
          <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground">
            {video.category}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base leading-tight">
            {video.name}
          </h3>
        </div>

        {/* Muscles */}
        <div className="flex flex-wrap gap-1.5">
          {video.muscles.slice(0, 3).map((muscle) => (
            <span
              key={muscle}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-medium"
            >
              <Target className="size-2.5" />
              {muscle}
            </span>
          ))}
          {video.muscles.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
              +{video.muscles.length - 3}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {video.description}
        </p>

        {/* Tip */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
          <Lightbulb className="size-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-primary/90 leading-relaxed">
            {video.tip}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: ExerciseVideo;
  onClose: () => void;
}) {
  const hasVideo = !!video.youtubeVideoId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-sm">{video.name}</h3>
            <p className="text-[10px] text-muted-foreground">{video.category}</p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-accent grid place-items-center transition"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Video Player — only for exercises with video */}
        {hasVideo && (
          <div className="relative aspect-video bg-black">
            <iframe
              src={getExerciseVideoEmbedUrl(video)}
              title={`Vídeo de execução: ${video.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}

        {/* Info Footer */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-foreground">{video.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {video.muscles.map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium"
              >
                <Target className="size-3" />
                {muscle}
              </span>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/90 leading-relaxed">{video.tip}</p>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Substitua o ID do vídeo em{" "}
            <code className="px-1 py-0.5 rounded bg-muted text-xs">src/data/exercise-videos.ts</code>{" "}
            para usar seus próprios vídeos.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="size-16 rounded-2xl bg-muted grid place-items-center mb-4">
        <Search className="size-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-display font-bold text-lg">Nenhum exercício encontrado</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Tente ajustar os filtros ou buscar por outro termo.
      </p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
      >
        <ChevronRight className="size-4" />
        Limpar filtros
      </button>
    </motion.div>
  );
}
