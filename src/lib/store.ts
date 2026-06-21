import { useEffect, useState, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";

export type StudentSessionInfo = {
  totalSessions: number;
  completedSessions: number;
  sessionMinutes: number;
  pricePerSession: number;
  daysPerWeek: number;
  totalWeeks: number;
  startDate: string;
};

export type UpcomingWorkout = {
  date: string;
  time: string;
  focus: string;
  exercises: string[];
};

export type StudentLink = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  gender?: string;
  sessions?: StudentSessionInfo;
  upcomingWorkouts?: UpcomingWorkout[];
};

export type Profile = {
  name: string;
  email: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female" | "other";
  goal: "hypertrophy" | "fat_loss" | "endurance" | "strength" | "general";
  level: "beginner" | "intermediate" | "advanced";
  experienceYears: number;
  daysPerWeek: number;
  minutesPerSession: number;
};

export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: number;
  notes?: string;
  done?: boolean;
  /** Optional custom video. Accepts YouTube URL/ID or direct video file URL (mp4/webm). */
  videoUrl?: string;
  /** Dicas customizadas (sobrescrevem as do catálogo). */
  customTips?: string[];
  /** Erros comuns customizados (sobrescrevem os do catálogo). */
  customMistakes?: string[];
};

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkoutDay = {
  day: DayKey;
  title: string;
  focus: string;
  exercises: Exercise[];
  customized?: boolean;
};

export type AppState = {
  authed: boolean;
  userId: string | null;
  role: "aluno" | "personal";
  onboarded: boolean;
  profile: Profile | null;
  plan: WorkoutDay[];
  darkMode: boolean;
  notifications: boolean;
  history: { date: string; dayKey: DayKey; completed: number; total: number }[];
  subscriptionActive: boolean;
  linkedStudents: StudentLink[];
  linkedTrainers: { id: string; name: string; specialty: string }[];
};

const KEY = "fittrack:v1";
const defaultState: AppState = {
  authed: false,
  userId: null,
  role: "aluno",
  onboarded: false,
  profile: null,
  plan: [],
  darkMode: false,
  notifications: true,
  history: [],
  subscriptionActive: false,
  linkedStudents: [],
  linkedTrainers: [],
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch {}
}
function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}
function emit() {
  listeners.forEach((l) => l());
}

let syncTimer: number | null = null;
let suppressCloudSync = false;

function toDbProfile(s: AppState, userId: string) {
  const profile = s.profile;
  if (!profile) return null;
  return {
    user_id: userId,
    email: profile.email,
    name: profile.name,
    weight: profile.weight,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
    goal: profile.goal,
    level: profile.level,
    experience_years: profile.experienceYears,
    days_per_week: profile.daysPerWeek,
    minutes_per_session: profile.minutesPerSession,
    onboarded: s.onboarded,
    dark_mode: s.darkMode,
    notifications: s.notifications,
    workout_plan: s.plan,
    workout_history: s.history,
  };
}

type FitTrackProfileRow = {
  user_id: string;
  email: string;
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  level: string;
  experience_years: number;
  days_per_week: number;
  minutes_per_session: number;
  onboarded: boolean;
  dark_mode: boolean;
  notifications: boolean;
  workout_plan: unknown;
  workout_history: unknown;
};

function fromDbProfile(row: FitTrackProfileRow): AppState {
  return {
    ...defaultState,
    authed: true,
    userId: row.user_id,
    onboarded: row.onboarded,
    profile: {
      name: row.name,
      email: row.email,
      weight: Number(row.weight),
      height: Number(row.height),
      age: Number(row.age),
      gender: ["male", "female", "other"].includes(row.gender) ? row.gender as Profile["gender"] : "other",
      goal: ["hypertrophy", "fat_loss", "endurance", "strength", "general"].includes(row.goal) ? row.goal as Profile["goal"] : "general",
      level: ["beginner", "intermediate", "advanced"].includes(row.level) ? row.level as Profile["level"] : "beginner",
      experienceYears: Number(row.experience_years),
      daysPerWeek: Number(row.days_per_week),
      minutesPerSession: Number(row.minutes_per_session),
    },
    darkMode: row.dark_mode,
    notifications: row.notifications,
    plan: Array.isArray(row.workout_plan) ? row.workout_plan as WorkoutDay[] : [],
    history: Array.isArray(row.workout_history) ? row.workout_history as AppState["history"] : [],
  };
}

function scheduleCloudSync() {
  if (typeof window === "undefined" || !state.authed || !state.userId || !state.profile) return;
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    void actions.syncProfileToCloud();
  }, 350);
}

let loaded = false;
function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    load();
    loaded = true;
  }
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
  if (!suppressCloudSync) scheduleCloudSync();
}

export function getState() {
  ensureLoaded();
  return state;
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    ensureLoaded();
    setHydrated(true);
    emit();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(hydrated ? state : defaultState),
  );
}

export const actions = {
  signIn(email: string, name = "Atleta", userId?: string) {
    setState((s) => ({
      ...s,
      authed: true,
      userId: userId ?? s.userId,
      profile: s.profile ?? ({
        name,
        email,
        weight: 75,
        height: 175,
        age: 25,
        gender: "other",
        goal: "general",
        level: "beginner",
        experienceYears: 0,
        daysPerWeek: 4,
        minutesPerSession: 60,
      } satisfies Profile),
    }));
  },
  setRole(role: "aluno" | "personal") {
    setState((s) => ({ ...s, role }));
  },
  activateSubscription() {
    setState((s) => ({ ...s, subscriptionActive: true }));
  },
  linkStudent(id: string, name: string, email: string, avatar?: string, sessions?: StudentSessionInfo, gender?: string, upcomingWorkouts?: UpcomingWorkout[]) {
    setState((s) => ({
      ...s,
      linkedStudents: s.linkedStudents.some((st) => st.id === id)
        ? s.linkedStudents
        : [...s.linkedStudents, { id, name, email, avatar, sessions, gender, upcomingWorkouts }],
    }));
  },
  completeStudentSession(studentId: string) {
    setState((s) => ({
      ...s,
      linkedStudents: s.linkedStudents.map((st) =>
        st.id === studentId && st.sessions
          ? { ...st, sessions: { ...st.sessions, completedSessions: Math.min(st.sessions.completedSessions + 1, st.sessions.totalSessions) } }
          : st,
      ),
    }));
  },
  switchRole(role: "aluno" | "personal") {
    setState((s) => ({ ...s, role }));
  },
  linkTrainer(id: string, name: string, specialty: string) {
    setState((s) => ({
      ...s,
      linkedTrainers: s.linkedTrainers.some((t) => t.id === id)
        ? s.linkedTrainers
        : [...s.linkedTrainers, { id, name, specialty }],
    }));
  },
  clearAuth() {
    setState((s) => ({ ...s, authed: false, userId: null }));
  },
  async restoreFromUser(user: User) {
    const email = user.email ?? "";
    const name = user.user_metadata?.name ?? email.split("@")[0] ?? "Atleta";
    const role = user.user_metadata?.role ?? "aluno";
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("fittrack_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      suppressCloudSync = true;
      if (data) {
        state = { ...fromDbProfile(data as FitTrackProfileRow), authed: true, userId: user.id, role: role as "aluno" | "personal" };
      } else {
        state = {
          ...defaultState,
          authed: true,
          userId: user.id,
          role: role as "aluno" | "personal",
          profile: {
            name,
            email,
            weight: 75,
            height: 175,
            age: 25,
            gender: "other",
            goal: "general",
            level: "beginner",
            experienceYears: 0,
            daysPerWeek: 4,
            minutesPerSession: 60,
          },
        };
        persist();
        emit();
        suppressCloudSync = false;
        await this.syncProfileToCloud();
        return;
      }
      persist();
      emit();
    } catch (error) {
      console.error("Erro ao restaurar perfil FitTrack", error);
      this.signIn(email, name, user.id);
      this.setRole((user.user_metadata?.role ?? "aluno") as "aluno" | "personal");
    } finally {
      suppressCloudSync = false;
    }
  },
  async syncProfileToCloud() {
    if (!state.authed || !state.userId || !state.profile) return;
    try {
      const payload = toDbProfile(state, state.userId);
      if (!payload) return;
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("fittrack_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao sincronizar perfil FitTrack", error);
    }
  },
  async signOut() {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.signOut();
    } catch {}
    setState((s) => ({ ...s, authed: false, userId: null }));
  },
  completeOnboarding(profile: Profile, plan: WorkoutDay[]) {
    setState((s) => ({ ...s, authed: true, onboarded: true, profile, plan }));
  },
  setPlan(plan: WorkoutDay[]) {
    setState((s) => ({ ...s, plan }));
  },
  // Mescla um plano novo da IA mantendo dias customizados pelo usuário
  mergePlanKeepingCustom(plan: WorkoutDay[]) {
    setState((s) => {
      const next = plan.map((newDay) => {
        const existing = s.plan.find((d) => d.day === newDay.day);
        if (existing?.customized) return existing;
        return newDay;
      });
      return { ...s, plan: next };
    });
  },
  setDayCustomized(day: DayKey, customized: boolean) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) => (d.day === day ? { ...d, customized } : d)),
    }));
  },
  ensureDay(day: DayKey, defaults?: { title?: string; focus?: string }) {
    setState((s) => {
      if (s.plan.some((d) => d.day === day)) return s;
      const label = ({ mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta", fri: "Sexta", sat: "Sábado", sun: "Domingo" } as Record<DayKey, string>)[day];
      return {
        ...s,
        plan: [
          ...s.plan,
          {
            day,
            title: defaults?.title ?? `Treino de ${label}`,
            focus: defaults?.focus ?? "Personalizado",
            exercises: [],
            customized: true,
          },
        ],
      };
    });
  },
  updateDay(day: DayKey, patch: Partial<WorkoutDay>) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) => (d.day === day ? { ...d, ...patch, customized: true } : d)),
    }));
  },
  addExercise(day: DayKey, ex: Omit<Exercise, "id">) {
    setState((s) => {
      const label = ({ mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta", fri: "Sexta", sat: "Sábado", sun: "Domingo" } as Record<DayKey, string>)[day];
      const exists = s.plan.some((d) => d.day === day);
      const basePlan = exists
        ? s.plan
        : [
            ...s.plan,
            {
              day,
              title: `Treino de ${label}`,
              focus: ex.muscle || "Personalizado",
              exercises: [],
              customized: true,
            } as WorkoutDay,
          ];
      return {
        ...s,
        plan: basePlan.map((d) =>
          d.day === day
            ? {
                ...d,
                customized: true,
                exercises: [
                  ...d.exercises,
                  { ...ex, id: `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
                ],
              }
            : d,
        ),
      };
    });
  },
  removeExercise(day: DayKey, id: string) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) =>
        d.day === day
          ? { ...d, customized: true, exercises: d.exercises.filter((e) => e.id !== id) }
          : d,
      ),
    }));
  },
  updateExercise(day: DayKey, id: string, patch: Partial<Exercise>) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) =>
        d.day === day
          ? {
              ...d,
              customized: true,
              exercises: d.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
            }
          : d,
      ),
    }));
  },
  reorderExercise(day: DayKey, from: number, to: number) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) => {
        if (d.day !== day) return d;
        const next = [...d.exercises];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...d, customized: true, exercises: next };
      }),
    }));
  },
  toggleExercise(day: DayKey, id: string) {
    setState((s) => ({
      ...s,
      plan: s.plan.map((d) =>
        d.day === day
          ? { ...d, exercises: d.exercises.map((e) => (e.id === id ? { ...e, done: !e.done } : e)) }
          : d,
      ),
    }));
  },
  setDarkMode(on: boolean) {
    setState((s) => ({ ...s, darkMode: on }));
  },
  setNotifications(on: boolean) {
    setState((s) => ({ ...s, notifications: on }));
  },
  updateProfile(p: Partial<Profile>) {
    setState((s) => ({ ...s, profile: s.profile ? { ...s.profile, ...p } : (p as Profile) }));
  },
  logSession(dayKey: DayKey, completed: number, total: number) {
    setState((s) => ({
      ...s,
      history: [{ date: new Date().toISOString(), dayKey, completed, total }, ...s.history].slice(0, 60),
    }));
  },
};
