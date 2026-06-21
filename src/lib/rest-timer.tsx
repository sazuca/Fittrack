import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type TimerState = {
  duration: number;
  endsAt: number | null;
  running: boolean;
};

type Ctx = {
  remaining: number;
  duration: number;
  running: boolean;
  start: (seconds: number) => void;
  stop: () => void;
  addSeconds: (delta: number) => void;
};

const RestTimerCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "fittrack:rest-timer";

function readStored(): TimerState {
  if (typeof window === "undefined") return { duration: 60, endsAt: null, running: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { duration: 60, endsAt: null, running: false };
}

function beep() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {}
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>({ duration: 60, endsAt: null, running: false });
  const [now, setNow] = useState(() => Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    setState(readStored());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [state.running]);

  const remaining = state.endsAt ? Math.max(0, Math.ceil((state.endsAt - now) / 1000)) : 0;

  useEffect(() => {
    if (state.running && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      beep();
      setState((s) => ({ ...s, running: false, endsAt: null }));
    }
    if (remaining > 0) firedRef.current = false;
  }, [state.running, remaining]);

  const start = useCallback((seconds: number) => {
    firedRef.current = false;
    setState({ duration: seconds, endsAt: Date.now() + seconds * 1000, running: true });
  }, []);
  const stop = useCallback(() => {
    setState((s) => ({ ...s, running: false, endsAt: null }));
  }, []);
  const addSeconds = useCallback((delta: number) => {
    setState((s) => {
      if (!s.endsAt) return s;
      return { ...s, endsAt: s.endsAt + delta * 1000 };
    });
  }, []);

  return (
    <RestTimerCtx.Provider value={{ remaining, duration: state.duration, running: state.running, start, stop, addSeconds }}>
      {children}
    </RestTimerCtx.Provider>
  );
}

export function useRestTimer() {
  const ctx = useContext(RestTimerCtx);
  if (!ctx) throw new Error("useRestTimer must be used within RestTimerProvider");
  return ctx;
}
