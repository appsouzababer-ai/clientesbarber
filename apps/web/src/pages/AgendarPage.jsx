import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase, getCliente, timeSlots, fmtDate, displayDate, slotDateTime } from "@/lib/barber";

export default function AgendarPage() {
  const navigate = useNavigate();
  const cliente = getCliente();
  const [step, setStep] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [servico, setServico] = useState(null);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [date, setDate] = useState(null);
  const [taken, setTaken] = useState([]);
  const [hora, setHora] = useState(null);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  async function carregar() {
    const { data } = await supabase
      .from("servicos")
      .select("*")
      .order("ordem");

    setServicos(data || []);
  }

  carregar();
}, []);

  useEffect(() => {
  if (!date) return;

  async function carregar() {
    const { data } = await supabase
      .from("agendamentos")
      .select("hora")
      .eq("data", date);

    setTaken((data || []).map((x) => x.hora));
  }

  carregar();
}, [date]);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDow = first.getDay();
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [month]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isUnavailable = (d) => { if (!d) return true; const dd = new Date(d); dd.setHours(0,0,0,0); return dd < today || d.getDay() === 0; };

  const slots = timeSlots();
  const now = new Date();

  const confirmar = async () => {
  setSaving(true);
  setError("");

  try {
    const { error } = await supabase
      .from("agendamentos")
      .insert({
        cliente_nome: cliente.nome,
        cliente_instagram: cliente.instagram,
        cliente_whatsapp: cliente.whatsapp,
        servico: servico.nome,
        preco: servico.preco,
        data: date,
        hora,
        observacoes: obs.trim(),
      });

    if (error) {
      setError("Erro ao agendar.");
      setStep(3);
      return;
    }

    setDone(true);
  } finally {
    setSaving(false);
  }
};

  if (done) {
    return (
      <AppShell title="Agendado" showBack={false}>
        <div className="flex flex-col items-center pt-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground"><PartyPopper className="h-10 w-10" /></div>
          <h2 className="mt-5 font-display text-3xl uppercase">Agendamento confirmado!</h2>
          <p className="mt-2 text-muted-foreground">{servico.nome} • {displayDate(date)} às {hora}</p>
          <button onClick={() => navigate("/app")} className="mt-8 h-12 w-full rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98]">Voltar para o início</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Agendar">
      <Steps step={step} />

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Escolha o serviço</h2>
          {servicos.map((s) => (
            <button key={s.id} onClick={() => { setServico(s); setStep(2); }}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left active:scale-[0.98] ${servico?.id === s.id ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
              <span className="font-medium">{s.nome}</span>
              <span className="font-display text-xl text-primary">R${s.preco}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-full bg-secondary p-2"><ChevronLeft className="h-5 w-5" /></button>
            <span className="font-display text-xl uppercase">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-full bg-secondary p-2"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["D","S","T","Q","Q","S","S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const un = isUnavailable(d);
              const iso = d ? fmtDate(d) : null;
              const sel = iso && iso === date;
              return (
                <button key={i} disabled={un} onClick={() => { setDate(iso); setHora(null); setStep(3); }}
                  className={`aspect-square rounded-lg text-sm ${!d ? "invisible" : un ? "text-muted-foreground/30" : sel ? "bg-primary text-primary-foreground" : "bg-card text-foreground active:scale-95"}`}>
                  {d?.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Dias em cinza estão indisponíveis.</p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-1 text-sm font-medium text-muted-foreground">{displayDate(date)} — escolha o horário</h2>
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-3 gap-2">
            {slots.map((h) => {
              const isTaken = taken.includes(h);
              const past = slotDateTime(date, h) < now;
              const dis = isTaken || past;
              const sel = hora === h;
              return (
                <button key={h} disabled={dis} onClick={() => setHora(h)}
                  className={`rounded-lg py-3 text-sm ${dis ? "bg-secondary/40 text-muted-foreground/30 line-through" : sel ? "bg-primary text-primary-foreground" : "bg-card active:scale-95"}`}>{h}</button>
              );
            })}
          </div>
          <button disabled={!hora} onClick={() => setStep(4)} className="mt-6 h-12 w-full rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98] disabled:opacity-40">Continuar</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <Row k="Serviço" v={`${servico.nome} — R$${servico.preco}`} />
            <Row k="Data" v={displayDate(date)} />
            <Row k="Hora" v={hora} />
            <Row k="Cliente" v={cliente.nome} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">Observações</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} placeholder="Algo que o barbeiro precise saber?" className="w-full rounded-xl border border-input bg-card p-3 outline-none placeholder:text-muted-foreground/60" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button disabled={saving} onClick={confirmar} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98] disabled:opacity-60">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5" /> Finalizar</>}
          </button>
        </div>
      )}
    </AppShell>
  );
}

function Steps({ step }) {
  return (
    <div className="mb-5 flex items-center gap-1">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-secondary"}`} />
      ))}
    </div>
  );
}
function Row({ k, v }) {
  return <div className="flex justify-between border-b border-border/60 py-2 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
