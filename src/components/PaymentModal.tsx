import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, Clock, CreditCard, Smartphone,
  FileText, Check, Lock, AlertTriangle, Copy,
  ArrowLeft, QrCode, Loader2, MessageSquare,
  Wallet, Timer, Calendar,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PaymentMethod = "pix" | "card" | "boleto";

interface PlanConfig {
  daysPerWeek: number;
  sessionMinutes: number;
  totalWeeks: number;
  pricePerSession: number;
}

function sessionPrice(minutes: number) {
  if (minutes <= 30) return 50;
  if (minutes <= 45) return 70;
  return 90;
}

export type PlanResult = {
  daysPerWeek: number;
  sessionMinutes: number;
  totalWeeks: number;
  pricePerSession: number;
  totalSessions: number;
  totalPrice: number;
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (plan: PlanResult) => void;
  trainerName: string;
  trainerPhone: string;
}

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  trainerName,
  trainerPhone,
}: PaymentModalProps) {
  const [step, setStep] = useState<"plan" | "method" | "payment" | "processing" | "success">("plan");
  const [plan, setPlan] = useState<PlanConfig>({
    daysPerWeek: 3,
    sessionMinutes: 45,
    totalWeeks: 4,
    pricePerSession: 70,
  });
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [pixTimeLeft, setPixTimeLeft] = useState(300);
  const [pixExpired, setPixExpired] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState(1);
  const [boletoCopied, setBoletoCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSessions = plan.daysPerWeek * plan.totalWeeks;
  const totalPrice = totalSessions * plan.pricePerSession;
  const installmentsOptions = [1, 2, 3, 4, 5, 6];
  const installmentValue = method === "card" ? totalPrice / (cardInstallments || 1) : totalPrice;

  function updateSessionMinutes(m: number) {
    setPlan((prev) => ({ ...prev, sessionMinutes: m, pricePerSession: sessionPrice(m) }));
  }

  function selectMethod(m: PaymentMethod) {
    setMethod(m);
    setStep("payment");
    if (m === "pix") generatePix();
  }

  function generatePix() {
    const pixPayload = [
      "000201", "010212",
      "26120014br.gov.bcb.pix",
      `2558fake.pix@${trainerName.toLowerCase().replace(/\s/g, "")}.com.br`,
      "52040000", "5303986",
      `5406${String(totalPrice.toFixed(2)).replace(".", "")}`,
      "5802BR",
      `5913${trainerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").slice(0, 2).join(" ")}`,
      "6008BRASILIA", "62070503***", "6304ABCD",
    ].join("");
    QRCode.toDataURL(pixPayload, { width: 280, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      .then(setQrCodeDataUrl)
      .catch(() => {
        const c = document.createElement("canvas");
        c.width = 280; c.height = 280;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 280, 280);
          ctx.fillStyle = "#000000";
          for (let r = 0; r < 11; r++)
            for (let col = 0; col < 11; col++)
              if ((r + col) % 2 === 0) ctx.fillRect(col * 20, r * 20, 20, 20);
          setQrCodeDataUrl(c.toDataURL());
        }
      });
    setPixExpired(false);
    setPixTimeLeft(300);
  }

  useEffect(() => {
    if (method !== "pix" || step !== "payment") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); setPixExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [method, step]);

  const pixMinutes = Math.floor(pixTimeLeft / 60);
  const pixSeconds = pixTimeLeft % 60;

  function handlePixPay() { setStep("processing"); setTimeout(() => setStep("success"), 2000); }
  function handleCardPay() {
    if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      toast.error("Preencha todos os dados do cartão"); return;
    }
    setStep("processing"); setTimeout(() => setStep("success"), 2500);
  }
  function handleBoletoPay() { setStep("processing"); setTimeout(() => setStep("success"), 2000); }

  function copyBoletoCode() {
    navigator.clipboard.writeText("34191.09001 12345.678901 23456.789012 1 12345678901234");
    setBoletoCopied(true);
    toast.success("Código de barras copiado!");
    setTimeout(() => setBoletoCopied(false), 3000);
  }
  function formatCardNumber(v: string) { return v.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19); }
  function formatExpiry(v: string) { return v.replace(/\D/g, "").replace(/(\d{2})(?=\d)/, "$1/").slice(0, 5); }

  function handleSuccess() {
    onSuccess({
      daysPerWeek: plan.daysPerWeek,
      sessionMinutes: plan.sessionMinutes,
      totalWeeks: plan.totalWeeks,
      pricePerSession: plan.pricePerSession,
      totalSessions,
      totalPrice,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (step !== "processing" && step !== "success") onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-xl border-2 border-primary/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-lg font-display font-bold">
            {step !== "plan" && step !== "success" && (
              <button
                onClick={() => step === "method" ? setStep("plan") : step === "payment" ? setStep("method") : null}
                className="p-1.5 hover:bg-muted/40 rounded-xl transition mr-1"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            {step === "plan" && "Contratar Personal Trainer"}
            {step === "method" && "Forma de Pagamento"}
            {step === "payment" && method === "pix" && "Pagamento via Pix"}
            {step === "payment" && method === "card" && "Pagamento via Cartão"}
            {step === "payment" && method === "boleto" && "Pagamento via Boleto"}
            {step === "processing" && "Processando..."}
            {step === "success" && "Pagamento Confirmado!"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ═══════ STEP 1: PLAN CONFIG ═══════ */}
            {step === "plan" && (
              <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Configure o plano de treino com <strong className="text-foreground">{trainerName}</strong>:
                </p>

                {/* Days per week — slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5" /> Dias por semana
                    </label>
                    <span className="text-lg font-display font-bold text-primary">{plan.daysPerWeek}x</span>
                  </div>
                  <input
                    type="range"
                    min={1} max={7} step={1}
                    value={plan.daysPerWeek}
                    onChange={(e) => setPlan((p) => ({ ...p, daysPerWeek: Number(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>1 dia</span><span>7 dias</span>
                  </div>
                </div>

                {/* Session duration — slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Timer className="size-3.5" /> Duração da sessão
                    </label>
                    <span className="text-lg font-display font-bold text-primary">{plan.sessionMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min={20} max={90} step={5}
                    value={plan.sessionMinutes}
                    onChange={(e) => updateSessionMinutes(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>20 min</span><span>90 min</span>
                  </div>
                </div>

                {/* Total weeks — slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Wallet className="size-3.5" /> Duração do plano
                    </label>
                    <span className="text-lg font-display font-bold text-primary">{plan.totalWeeks} {plan.totalWeeks === 1 ? "semana" : "semanas"}</span>
                  </div>
                  <input
                    type="range"
                    min={1} max={16} step={1}
                    value={plan.totalWeeks}
                    onChange={(e) => setPlan((p) => ({ ...p, totalWeeks: Number(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>1 semana</span><span>16 semanas</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de sessões</span>
                    <span className="font-semibold">{totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor por sessão</span>
                    <span className="font-semibold">R$ {plan.pricePerSession},00</span>
                  </div>
                  <div className="border-t border-primary/10 pt-2.5 flex justify-between text-lg">
                    <span className="font-bold">Valor total</span>
                    <span className="font-bold text-primary">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <Button onClick={() => setStep("method")} className="w-full py-6 text-base cursor-pointer gap-2 rounded-2xl">
                  <CreditCard className="size-5" />
                  Continuar para Pagamento
                </Button>
              </motion.div>
            )}

            {/* ═══════ STEP 2: PAYMENT METHOD ═══════ */}
            {step === "method" && (
              <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center mb-2">
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                  <p className="text-3xl font-display font-bold text-primary">R$ {totalPrice.toFixed(2).replace(".", ",")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{totalSessions} sessões de {plan.sessionMinutes} min</p>
                </div>

                <button onClick={() => selectMethod("pix")} className="w-full p-5 rounded-2xl border-2 border-border hover:border-green-400/50 hover:bg-green-500/5 transition-all flex items-center gap-4 text-left group">
                  <div className="size-14 rounded-xl bg-green-500/10 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <QrCode className="size-7 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">Pix</p>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo com QR Code</p>
                  </div>
                  <Smartphone className="size-6 text-muted-foreground/40" />
                </button>

                <button onClick={() => selectMethod("card")} className="w-full p-5 rounded-2xl border-2 border-border hover:border-blue-400/50 hover:bg-blue-500/5 transition-all flex items-center gap-4 text-left group">
                  <div className="size-14 rounded-xl bg-blue-500/10 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <CreditCard className="size-7 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">Cartão de Crédito</p>
                    <p className="text-sm text-muted-foreground">Parcele em até 6x sem juros</p>
                  </div>
                  <Lock className="size-6 text-muted-foreground/40" />
                </button>

                <button onClick={() => selectMethod("boleto")} className="w-full p-5 rounded-2xl border-2 border-border hover:border-amber-400/50 hover:bg-amber-500/5 transition-all flex items-center gap-4 text-left group">
                  <div className="size-14 rounded-xl bg-amber-500/10 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="size-7 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">Boleto Bancário</p>
                    <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                  </div>
                  <Clock className="size-6 text-muted-foreground/40" />
                </button>
              </motion.div>
            )}

            {/* ═══════ PIX ═══════ */}
            {step === "payment" && method === "pix" && (
              <motion.div key="payment-pix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-2 text-center space-y-5">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className={`size-4 ${pixExpired ? "text-destructive" : pixTimeLeft < 60 ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className={pixExpired ? "text-destructive font-semibold" : pixTimeLeft < 60 ? "text-amber-500 font-semibold" : "text-muted-foreground"}>
                    {pixExpired ? "QR Code expirado" : `${String(pixMinutes).padStart(2, "0")}:${String(pixSeconds).padStart(2, "0")}`}
                  </span>
                </div>

                {pixExpired ? (
                  <div className="space-y-4">
                    <div className="size-52 rounded-2xl bg-muted grid place-items-center mx-auto">
                      <AlertTriangle className="size-14 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">O QR Code expirou. Clique abaixo para gerar um novo.</p>
                    <Button onClick={generatePix} className="cursor-pointer gap-2 rounded-2xl">
                      <QrCode className="size-4" /> Gerar novo QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {qrCodeDataUrl && (
                      <div className="inline-block p-3 rounded-2xl border-2 border-border bg-white">
                        <img src={qrCodeDataUrl} alt="QR Code Pix" className="size-52" />
                      </div>
                    )}
                    {!qrCodeDataUrl && (
                      <div className="size-52 mx-auto rounded-2xl bg-muted grid place-items-center">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Escaneie o QR Code com seu banco para pagar <strong className="text-foreground">R$ {totalPrice.toFixed(2).replace(".", ",")}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Chave Pix: {trainerName.toLowerCase().replace(/\s/g, "")}@fittrack.com.br
                    </p>
                    <Button onClick={handlePixPay} className="w-full cursor-pointer gap-2 py-6 text-base bg-green-600 hover:bg-green-700 rounded-2xl">
                      <CheckCircle2 className="size-5" />
                      Já paguei — Confirmar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════ CREDIT CARD ═══════ */}
            {step === "payment" && method === "card" && (
              <motion.div key="payment-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Número do cartão</label>
                    <input placeholder="0000 0000 0000 0000" value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Nome no cartão</label>
                    <input placeholder="Como está gravado no cartão" value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Validade</label>
                      <input placeholder="MM/AA" value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">CVV</label>
                      <input placeholder="123" value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Parcelas</label>
                    <select value={cardInstallments} onChange={(e) => setCardInstallments(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {installmentsOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}x de R$ {(totalPrice / n).toFixed(2).replace(".", ",")}{n > 1 ? "" : " (sem juros)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3 shrink-0" />
                  Pagamento processado com criptografia de ponta a ponta (simulação)
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="ghost" onClick={() => setStep("method")} className="flex-1 cursor-pointer rounded-2xl">Voltar</Button>
                  <Button onClick={handleCardPay} className="flex-1 cursor-pointer gap-2 py-6 rounded-2xl">
                    <Lock className="size-4" />
                    Pagar R$ {installmentValue.toFixed(2).replace(".", ",")}{cardInstallments > 1 ? ` × ${cardInstallments}` : ""}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ═══════ BOLETO ═══════ */}
            {step === "payment" && method === "boleto" && (
              <motion.div key="payment-boleto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-8 rounded-2xl border-2 border-dashed border-border bg-muted/20 text-center space-y-4">
                  <FileText className="size-12 text-amber-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-lg">Boleto Bancário</p>
                    <p className="text-sm text-muted-foreground">Vencimento: {new Date(Date.now() + 3 * 86400000).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="font-mono text-sm tracking-widest bg-muted p-4 rounded-xl select-all border border-border">
                    34191.09001 12345.678901 23456.789012 1 12345678901234
                  </div>
                  <Button onClick={copyBoletoCode} variant="outline" className="gap-2 cursor-pointer rounded-2xl">
                    {boletoCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {boletoCopied ? "Copiado!" : "Copiar código de barras"}
                  </Button>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground text-left">
                    O boleto será pago em até 3 dias úteis. Após a confirmação, o personal será vinculado automaticamente.
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="ghost" onClick={() => setStep("method")} className="flex-1 cursor-pointer rounded-2xl">Voltar</Button>
                  <Button onClick={handleBoletoPay} className="flex-1 cursor-pointer gap-2 py-6 bg-amber-600 hover:bg-amber-700 rounded-2xl">
                    <FileText className="size-4" />
                    Pagar Boleto — R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ═══════ PROCESSING ═══════ */}
            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center space-y-4">
                <motion.div className="size-24 rounded-full gradient-primary grid place-items-center mx-auto"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Loader2 className="size-10 text-primary-foreground animate-spin" />
                </motion.div>
                <p className="font-semibold text-xl">Processando pagamento...</p>
                <p className="text-sm text-muted-foreground">Aguardando confirmação...</p>
              </motion.div>
            )}

            {/* ═══════ SUCCESS ═══════ */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-6">
                <div className="size-24 rounded-full bg-green-500/15 grid place-items-center mx-auto">
                  <CheckCircle2 className="size-12 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="font-display font-bold text-2xl">Pagamento Confirmado!</p>
                  <p className="text-sm text-muted-foreground">
                    Você contratou <strong className="text-foreground">{trainerName}</strong> com sucesso!
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {totalSessions} sessões de {plan.sessionMinutes} min — Total: R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/20 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Agora é só entrar em contato com <strong className="text-foreground">{trainerName}</strong> pelo WhatsApp para começar!
                  </p>
                  <Button
                    onClick={handleSuccess}
                    className="w-full cursor-pointer gap-3 py-6 text-base bg-green-600 hover:bg-green-700 rounded-2xl"
                  >
                    <MessageSquare className="size-5" />
                    Falar com {trainerName} no WhatsApp
                  </Button>
                  <p className="text-[10px] text-muted-foreground/60">
                    O vínculo será criado automaticamente ao clicar
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog primitives ──
function Dialog({ open, children, onOpenChange }: { open: boolean; children: React.ReactNode; onOpenChange: (v: boolean) => void }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-3xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
        {children}
      </motion.div>
    </motion.div>
  );
}

function DialogContent({ className, children, ...props }: { className?: string; children: React.ReactNode } & Record<string, unknown>) {
  return <div className={className} {...props}>{children}</div>;
}

function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={className}>{children}</h3>;
}
