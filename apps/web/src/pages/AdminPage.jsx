import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CalendarDays, Scissors, Phone, Instagram, LogOut, Loader2, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase, whatsappLink, instagramLink, displayDate, logoutAll } from "@/lib/barber";

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("clientes");

  useEffect(() => {
  const admin = JSON.parse(localStorage.getItem("souza_admin") || "null");
  if (!admin?.is_admin) navigate("/");
}, [navigate]);

  const sair = () => { logoutAll(); navigate("/"); };

  return (
    <AppShell title="Painel Admin" showBack={false}
      right={<button onClick={sair} aria-label="Sair" className="text-muted-foreground"><LogOut className="h-5 w-5" /></button>}>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
        {[["clientes", "Clientes", Users], ["agendamentos", "Agenda", CalendarDays], ["servicos", "Serviços", Scissors]].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      {tab === "clientes" && <Clientes />}
      {tab === "agendamentos" && <Agenda />}
      {tab === "servicos" && <Servicos />}
    </AppShell>
  );
}

function Clientes() {
  const [list, setList] = useState(null);
  useEffect(() => {
  async function carregar() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (error) setList([]);
    else setList(data);
  }

  carregar();
}, []);
  if (!list) return <Spinner />;
  if (!list.length) return <Empty text="Nenhum cliente." />;
  return (
    <div className="space-y-2">
      {list.map((c) => (
        <div key={c.id} className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold">{c.nome}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a href={whatsappLink(c.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><Phone className="h-4 w-4" />{c.whatsapp}</a>
            <a href={instagramLink(c.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><Instagram className="h-4 w-4" />@{c.instagram}</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function Agenda() {
  const [list, setList] = useState(null);
  useEffect(() => {
  async function carregar() {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data")
      .order("hora");

    if (error) setList([]);
    else setList(data);
  }

  carregar();
}, []);
  if (!list) return <Spinner />;
  if (!list.length) return <Empty text="Nenhum agendamento." />;
  const groups = list.reduce((acc, a) => { (acc[a.data] ||= []).push(a); return acc; }, {});
  return (
    <div className="space-y-5">
      {Object.keys(groups).sort().map((d) => (
        <div key={d}>
          <h3 className="mb-2 font-display text-xl uppercase text-primary">{displayDate(d)}</h3>
          <div className="space-y-2">
            {groups[d].map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{a.hora} — {a.cliente_nome}</span>
                  <span className="text-sm text-muted-foreground">{a.servico}</span>
                </div>
                <a href={whatsappLink(a.cliente_whatsapp)} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-sm text-primary"><Phone className="h-4 w-4" />{a.cliente_whatsapp}</a>
                {a.observacoes && <p className="mt-1 text-xs text-muted-foreground">Obs: {a.observacoes}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Servicos() {
  const [list, setList] = useState(null);
  const [saving, setSaving] = useState(null);
  useEffect(() => {
  async function carregar() {
    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .order("ordem");

    if (error) setList([]);
    else setList(data);
  }

  carregar();
}, []);
  const save = async (s, preco) => {
  setSaving(s.id);

  try {
    await supabase
      .from("servicos")
      .update({
        preco: Number(preco) || 0,
      })
      .eq("id", s.id);
  } finally {
    setSaving(null);
  }
};
  if (!list) return <Spinner />;
  return (
    <div className="space-y-2">
      {list.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <span className="flex-1 font-medium">{s.nome}</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">R$</span>
            <input type="number" defaultValue={s.preco} onBlur={(e) => save(s, e.target.value)}
              className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-right outline-none" />
            {saving === s.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Check className="h-4 w-4 text-primary/40" />}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Toque fora do campo para salvar o preço.</p>
    </div>
  );
}

function Spinner() { return <div className="flex justify-center pt-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>; }
function Empty({ text }) { return <p className="pt-10 text-center text-muted-foreground">{text}</p>; }
