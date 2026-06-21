import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, User, Loader2, Dumbbell, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { actions } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"aluno" | "personal">("aluno");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pass || (mode === "signup" && !name)) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { name, role: selectedRole } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      }
      const displayName = mode === "signup" ? name : email.split("@")[0] || "Atleta";
      actions.signIn(email, displayName);
      actions.setRole(selectedRole);
      toast.success(mode === "signup" ? "Conta criada com sucesso!" : "Bem-vindo de volta!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center">
            <Activity className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">FitTrack</span>
        </Link>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setSelectedRole("aluno")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition border ${
              selectedRole === "aluno"
                ? "gradient-primary text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                : "bg-card border-border text-foreground hover:bg-accent"
            }`}
          >
            <Dumbbell className="size-4" />
            Aluno
          </button>
          <button
            onClick={() => setSelectedRole("personal")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition border ${
              selectedRole === "personal"
                ? "gradient-primary text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                : "bg-card border-border text-foreground hover:bg-accent"
            }`}
          >
            <UserCheck className="size-4" />
            Personal
          </button>
        </div>

        <h1 className="text-3xl font-display font-bold tracking-tight">
          {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedRole === "personal"
            ? mode === "signin" ? "Acesse seu painel profissional." : "Cadastre-se como Personal Trainer."
            : mode === "signin" ? "Continue sua evolução." : "Comece sua jornada fitness premium."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <Field icon={User} placeholder="Nome" value={name} onChange={setName} />
          )}
          <Field icon={Mail} placeholder="Email" type="email" value={email} onChange={setEmail} />
          <Field icon={Lock} placeholder="Senha" type="password" value={pass} onChange={setPass} />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          {mode === "signin" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "signin" ? "Cadastrar" : "Entrar"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Icon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
      />
    </div>
  );
}
