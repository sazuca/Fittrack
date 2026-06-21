import { useEffect, useRef, useState } from "react";
import { GitCompare } from "lucide-react";

export function CompareBeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFrom(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }

  useEffect(() => {
    function up() {
      dragging.current = false;
    }
    function move(e: PointerEvent) {
      if (!dragging.current) return;
      e.preventDefault();
      updateFrom(e.clientX);
    }
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Slider comparativo</p>
      <div
        ref={ref}
        className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-glass-border select-none touch-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          updateFrom(e.clientX);
        }}
        style={{ touchAction: "none" }}
      >
        <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img
            src={before}
            alt="Antes"
            className="absolute inset-0 h-full object-cover"
            style={{ width: ref.current?.clientWidth ?? "100%", maxWidth: "none" }}
            draggable={false}
          />
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-11 rounded-full bg-white shadow-xl grid place-items-center text-primary">
            <GitCompare className="size-5" />
          </div>
        </div>
        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold tracking-wider">ANTES</span>
        <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-wider">DEPOIS</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="w-full max-w-md mx-auto block accent-primary"
        aria-label="Posição do comparador"
      />
    </div>
  );
}
