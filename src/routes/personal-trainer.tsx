import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, MessageSquare, Star, CheckCircle2,
  Award, TrendingUp, MapPin, Check, Users,
  Sparkles, Search, Phone, ShoppingCart, DollarSign,
  Calendar, Clock, BrainCircuit, BarChart3, Plus,
  Dumbbell, Loader2, ListChecks, User,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentModal, type PlanResult } from "@/components/PaymentModal";
import { actions, useAppState } from "@/lib/store";
import { toast } from "sonner";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/personal-trainer")({
  component: PersonalTrainerPage,
});

/* ─── Mock Data for Vitrine ─── */
const MOCK_TRAINERS = [
  {
    id: "mariana-lopes",
    name: "Mariana Lopes",
    specialty: "Funcional e Emagrecimento",
    phone: "5511999990001",
    bio: "Especialista em treino funcional e reeducação alimentar. Certificada pela ACSM e CREF-SP.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    location: "São Paulo, SP",
    rating: 4.9,
    clients: 96,
    online: true,
  },
  {
    id: "felipe-silva",
    name: "Felipe Silva",
    specialty: "Hipertrofia e Força",
    phone: "5511999990002",
    bio: "Especialista em transformação corporal com mais de 10 anos de experiência. Certificado pela NSCA e CREF-SP.",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
    location: "São Paulo, SP",
    rating: 4.9,
    clients: 128,
    online: true,
  },
  {
    id: "ana-beatriz",
    name: "Ana Beatriz Costa",
    specialty: "Yoga e Mobilidade",
    phone: "5521999990003",
    bio: "Instrutora de Yoga e mobilidade funcional. Ajudo você a ganhar flexibilidade, reduzir dores e melhorar sua postura no dia a dia.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    location: "Rio de Janeiro, RJ",
    rating: 4.8,
    clients: 74,
    online: true,
  },
  {
    id: "rafael-oliveira",
    name: "Rafael Oliveira",
    specialty: "Cross Training e Performance",
    phone: "5531999990004",
    bio: "Coach de alta performance esportiva. Preparo atletas para competições de CrossFit, corrida e provas de endurance.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "Belo Horizonte, MG",
    rating: 4.7,
    clients: 112,
    online: false,
  },
  {
    id: "juliana-martins",
    name: "Juliana Martins",
    specialty: "Reabilitação e Pilates",
    phone: "5541999990005",
    bio: "Fisioterapeuta especializada em pilates clínico e reabilitação pós-lesão. Ideal para quem busca recuperação com segurança.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    location: "Curitiba, PR",
    rating: 4.9,
    clients: 63,
    online: true,
  },
];

/* ─── Main: dispatch by role ─── */
function PersonalTrainerPage() {
  const role = useAppState((s) => s.role);
  if (role === "personal") return <PersonalDashboard />;
  return <AlunoMarketplace />;
}

/* ═══════════════════════════════════════════════════
   ALUNO — Browse & Hire Trainers
   ═══════════════════════════════════════════════════ */
function AlunoMarketplace() {
  const profile = useAppState((s) => s.profile);
  const linkedTrainers = useAppState((s) => s.linkedTrainers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState<typeof MOCK_TRAINERS[0] | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [hiredOpen, setHiredOpen] = useState(false);
  const [hiredTrainer, setHiredTrainer] = useState<typeof MOCK_TRAINERS[0] | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_TRAINERS;
    const q = searchQuery.toLowerCase();
    return MOCK_TRAINERS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const openPayment = (trainer: typeof MOCK_TRAINERS[0]) => {
    setSelectedTrainer(trainer);
    setPaymentOpen(true);
  };

  const onPaymentSuccess = (plan: PlanResult) => {
    if (!selectedTrainer) return;
    setHiredTrainer(selectedTrainer);
    actions.linkTrainer(selectedTrainer.id, selectedTrainer.name, selectedTrainer.specialty);
    if (profile) {
      actions.linkStudent(
        `${Date.now()}-${profile.name.replace(/\s/g, "")}`,
        profile.name,
        profile.email,
        undefined,
        {
          totalSessions: plan.totalSessions,
          completedSessions: 0,
          sessionMinutes: plan.sessionMinutes,
          pricePerSession: plan.pricePerSession,
          daysPerWeek: plan.daysPerWeek,
          totalWeeks: plan.totalWeeks,
          startDate: new Date().toISOString(),
        },
      );
    }
    const msg = encodeURIComponent(
      `Olá ${selectedTrainer.name}! Acabei de contratar seu pacote pelo FitTrack (${plan.totalSessions} sessões de ${plan.sessionMinutes} min). Vamos começar?`
    );
    window.open(`https://wa.me/${selectedTrainer.phone}?text=${msg}`, "_blank");
    setHiredOpen(true);
    toast.success(`Pagamento confirmado! Vínculo criado com ${selectedTrainer.name}!`);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Personal Trainer</h1>
        <p className="text-muted-foreground mt-1">
          Encontre o profissional ideal para sua jornada fitness.
        </p>
      </motion.div>

      {linkedTrainers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="size-5 text-primary" />
              <h2 className="font-display font-bold">Meus Personais</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {linkedTrainers.map((t) => (
                <div key={t.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Check className="size-4" />
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, especialidade ou local..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <motion.div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((trainer, i) => (
            <motion.div
              key={trainer.id} layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <GlassCard className="p-5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img src={trainer.avatar} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20" />
                    {trainer.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold truncate">{trainer.name}</h3>
                    <p className="text-xs text-primary font-medium truncate">{trainer.specialty}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{trainer.bio}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><MapPin className="size-3" />{trainer.location}</span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3 text-amber-400 fill-amber-400" />
                    {trainer.rating} ({trainer.clients})
                  </span>
                </div>
                <div className="mt-auto">
                  <Button onClick={() => openPayment(trainer)} className="w-full cursor-pointer gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <ShoppingCart className="size-4" /> Contratar
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {selectedTrainer && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onSuccess={onPaymentSuccess}
          trainerName={selectedTrainer.name}
          trainerPhone={selectedTrainer.phone}
        />
      )}

      <Dialog open={hiredOpen} onOpenChange={setHiredOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border text-center">
          <div className="py-6">
            <div className="size-16 rounded-full bg-green-500/15 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="size-8 text-green-400" />
            </div>
            <DialogTitle className="text-xl font-display font-bold">Vínculo Criado!</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Você contratou <strong>{hiredTrainer?.name}</strong>!
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              O WhatsApp foi aberto com uma mensagem para começar.
            </p>
          </div>
          <Button onClick={() => setHiredOpen(false)} className="w-full cursor-pointer">Continuar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PERSONAL DASHBOARD — Full PT view
   ═══════════════════════════════════════════════════ */
function PersonalDashboard() {
  const profile = useAppState((s) => s.profile);
  const linkedStudents = useAppState((s) => s.linkedStudents);
  const [seeded, setSeeded] = useState(false);

  /* ─── Seed fake students ─── */
  const students = useMemo(() => {
    if (!seeded && linkedStudents.length === 0) {
      const fakes = createFakeStudents();
      fakes.forEach((s) => {
        actions.linkStudent(s.id, s.name, s.email, s.avatar, s.sessions, s.gender, s.upcomingWorkouts);
      });
      setSeeded(true);
      return fakes;
    }
    return linkedStudents;
  }, [seeded, linkedStudents]);

  /* ─── Derived stats ─── */
  const totalStudents = students.length;
  const totalRevenue = students.reduce(
    (sum, s) => sum + (s.sessions?.completedSessions ?? 0) * (s.sessions?.pricePerSession ?? 70),
    0,
  );
  const totalRemaining = students.reduce(
    (sum, s) => sum + ((s.sessions?.totalSessions ?? 0) - (s.sessions?.completedSessions ?? 0)),
    0,
  );
  const totalSessionsAll = students.reduce(
    (sum, s) => sum + (s.sessions?.completedSessions ?? 0),
    0,
  );
  const potentialRevenue = students.reduce(
    (sum, s) => sum + (s.sessions?.totalSessions ?? 0) * (s.sessions?.pricePerSession ?? 70),
    0,
  );

  /* ─── All upcoming workouts flat list ─── */
  const allUpcoming = students.flatMap((s) =>
    (s.upcomingWorkouts ?? []).map((w) => ({ ...w, studentName: s.name, studentId: s.id })),
  ).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  /* ─── Monthly revenue chart ─── */
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const monthlyData = months.map((month, i) => {
    const factor = (i + 1) / months.length;
    return { month, receita: Math.round((totalRevenue || 4800) * factor * (0.8 + Math.random() * 0.4)) };
  });

  /* ─── AI suggestion generator ─── */
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const AI_TIPS = [
    "Sugira treinos com progressão de carga para alunos que estão há mais de 4 semanas no mesmo peso.",
    "Alunos com mais de 80% de frequência merecem um bônus — envie um treino surpresa!",
    "Analise a evolução fotográfica dos seus alunos a cada 30 dias para ajustar o plano.",
    "Inclua exercícios unilaterais para corrigir assimetrias musculares detectadas.",
    "Ajuste a ingestão proteica dos alunos que estão em platô de perda de gordura.",
    "Use a periodização ondulatória semanal para evitar estagnação nos resultados.",
    "Alunos que treinam pela manhã têm melhor adesão — incentive horários fixos.",
    "Varie o estímulo a cada 4-6 semanas para evitar adaptação neural.",
  ];

  function generateAiTip() {
    setAiLoading(true);
    setTimeout(() => {
      setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
      setAiLoading(false);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
            Painel Personal
          </h1>
          <p className="text-muted-foreground mt-1">
            Olá, {profile?.name?.split(" ")[0]} — Gerencie seus alunos e negócio.
          </p>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Receita Realizada" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`} sub={`Potencial: R$ ${potentialRevenue.toLocaleString("pt-BR")}`} color="text-green-500" />
        <StatCard icon={Users} label="Alunos Ativos" value={String(totalStudents)} sub={totalStudents === 1 ? "1 aluno" : `${totalStudents} alunos`} color="text-blue-500" />
        <StatCard icon={Calendar} label="Total de Sessões" value={String(totalSessionsAll)} sub={`${totalRemaining} restantes`} color="text-purple-500" />
        <StatCard icon={Clock} label="Aulas Restantes" value={String(totalRemaining)} sub={totalRemaining === 1 ? "1 aula" : `${totalRemaining} aulas`} color="text-amber-500" />
      </motion.div>

      {/* ─── Revenue Chart ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Receita Mensal</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="month" stroke="currentColor" fontSize={11} />
                <YAxis stroke="currentColor" fontSize={11} tickFormatter={(v: number) => `R$${v}`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                  formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                <Bar dataKey="receita" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── AI Tip ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Assistente IA</h2>
          </div>
          {aiTip ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{aiTip}</p>
              </div>
              <Button onClick={generateAiTip} disabled={aiLoading} size="sm" variant="ghost" className="mt-3 cursor-pointer gap-2">
                {aiLoading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                Nova sugestão
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Button onClick={generateAiTip} disabled={aiLoading} className="cursor-pointer gap-2">
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Gerar dica inteligente
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── Próximos Treinos ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Próximos Treinos</h2>
          </div>
          {allUpcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum treino agendado.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {allUpcoming.slice(0, 8).map((w, i) => (
                <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <span className="text-xs font-bold text-primary">{formatDay(w.date)}</span>
                    <span className="text-[10px] text-muted-foreground">{w.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{w.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{w.focus}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{w.exercises.join(" · ")}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0 cursor-pointer text-xs gap-1"
                    onClick={() => {
                      const msg = encodeURIComponent(`Olá! Lembrete: temos treino hoje (${w.focus}) às ${w.time}. Te espero!`);
                      window.open(`https://wa.me/55${w.studentId}?text=${msg}`, "_blank");
                    }}>
                    <MessageSquare className="size-3" /> Lembrar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── Students List ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Meus Alunos</h2>
          <span className="text-xs text-muted-foreground">({totalStudents})</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const completed = student.sessions?.completedSessions ?? 0;
            const total = student.sessions?.totalSessions ?? 0;
            const remaining = total - completed;
            const revenue = completed * (student.sessions?.pricePerSession ?? 70);
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const initials = student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            const isWoman = student.gender === "female";
            const avatarGrad = isWoman
              ? "bg-gradient-to-br from-pink-500 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-cyan-600";

            return (
              <GlassCard key={student.id} className="hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-xl ${avatarGrad} grid place-items-center text-white font-bold text-lg`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                </div>

                {student.sessions ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/40 text-center">
                        <p className="text-muted-foreground">Sessões</p>
                        <p className="font-bold text-foreground">{completed}/{total}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 text-center">
                        <p className="text-muted-foreground">Restantes</p>
                        <p className="font-bold text-foreground">{remaining}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 text-center">
                        <p className="text-muted-foreground">Receita</p>
                        <p className="font-bold text-green-500">R$ {revenue}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 text-center">
                        <p className="text-muted-foreground">Duração</p>
                        <p className="font-bold text-foreground">{student.sessions.sessionMinutes}min</p>
                      </div>
                    </div>

                    {/* Próximos treinos do aluno */}
                    {student.upcomingWorkouts && student.upcomingWorkouts.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Próximos treinos</p>
                        <div className="space-y-1">
                          {student.upcomingWorkouts.slice(0, 3).map((w, wi) => (
                            <div key={wi} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30">
                              <Calendar className="size-3 text-primary shrink-0" />
                              <span className="font-medium">{formatDay(w.date)}</span>
                              <span className="text-muted-foreground">{w.time}</span>
                              <span className="ml-auto text-muted-foreground truncate">{w.focus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 cursor-pointer text-xs gap-1"
                        onClick={() => {
                          const msg = encodeURIComponent(`Olá ${student.name}! Tudo bem? Vamos treinar hoje?`);
                          window.open(`https://wa.me/55${student.email.split("@")[0]}?text=${msg}`, "_blank");
                        }}>
                        <MessageSquare className="size-3" /> Mensagem
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 cursor-pointer text-xs gap-1"
                        onClick={() => {
                          actions.completeStudentSession(student.id);
                          toast.success(`Sessão concluída para ${student.name}!`);
                        }}>
                        <CheckCircle2 className="size-3" /> Concluir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 cursor-pointer text-xs gap-1"
                      onClick={() => {
                        actions.linkStudent(student.id, student.name, student.email, undefined, {
                          totalSessions: 24, completedSessions: 0, sessionMinutes: 45,
                          pricePerSession: 70, daysPerWeek: 3, totalWeeks: 8, startDate: new Date().toISOString(),
                        });
                        toast.success("Plano padrão atribuído!");
                      }}>
                      <Plus className="size-3" /> Atribuir Plano
                    </Button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Fake students factory ─── */
function createFakeStudents() {
  const today = new Date();
  const dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  function futureDate(daysFromNow: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function futureWorkouts(baseDays: number[]): { date: string; time: string; focus: string; exercises: string[] }[] {
    return baseDays.map((offset) => ({
      date: futureDate(offset),
      time: offset % 2 === 0 ? "08:00" : "10:00",
      focus: ["Treino A - Superior", "Treino B - Inferior", "Treino C - Full Body"][offset % 3],
      exercises: ["Supino", "Remada", "Agachamento", "Leg Press", "Rosca Direta", "Tríceps Corda"].slice(0, 4 + (offset % 3)),
    }));
  }

  return [
    {
      id: "hellen-silva",
      name: "Hellen Silva",
      email: "hellen.silva@email.com",
      gender: "female",
      sessions: {
        totalSessions: 24, completedSessions: 12, sessionMinutes: 45,
        pricePerSession: 70, daysPerWeek: 3, totalWeeks: 8,
        startDate: new Date(today.getTime() - 45 * 86400000).toISOString(),
      },
      upcomingWorkouts: futureWorkouts([1, 3, 5, 8, 10, 12]),
    },
    {
      id: "joao-oliveira",
      name: "João Oliveira",
      email: "joao.oliveira@email.com",
      gender: "male",
      sessions: {
        totalSessions: 48, completedSessions: 30, sessionMinutes: 60,
        pricePerSession: 90, daysPerWeek: 5, totalWeeks: 10,
        startDate: new Date(today.getTime() - 70 * 86400000).toISOString(),
      },
      upcomingWorkouts: futureWorkouts([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]),
    },
    {
      id: "lucas-santos",
      name: "Lucas Santos",
      email: "lucas.santos@email.com",
      gender: "male",
      sessions: {
        totalSessions: 36, completedSessions: 8, sessionMinutes: 50,
        pricePerSession: 70, daysPerWeek: 4, totalWeeks: 9,
        startDate: new Date(today.getTime() - 20 * 86400000).toISOString(),
      },
      upcomingWorkouts: futureWorkouts([1, 3, 5, 7, 9, 11, 13]),
    },
  ];
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <GlassCard className="text-center hover:scale-[1.02] transition-transform duration-300 cursor-default">
      <Icon className={`size-5 mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </GlassCard>
  );
}
