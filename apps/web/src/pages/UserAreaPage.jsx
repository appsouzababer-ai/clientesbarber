import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Instagram, Phone, CalendarPlus, CalendarClock, LogOut } from "lucide-react";
import AppShell from "@/components/AppShell";
import { LOGO, SHOP, whatsappLink, getCliente, logoutAll } from "@/lib/barber";

export default function UserAreaPage() {
  const navigate = useNavigate();
  const cliente = getCliente();

  const sair = () => { logoutAll(); navigate("/"); };

  return (
    <AppShell title="Souza Barbershop" showBack={false}
      right={<button onClick={sair} aria-label="Sair" className="text-muted-foreground"><LogOut className="h-5 w-5" /></button>}>
      <div className="flex flex-col items-center">
        <img src={LOGO} alt="Souza Barbershop" className="h-32 w-32 rounded-full object-contain" />
        {cliente && <p className="mt-3 text-sm text-muted-foreground">Olá, <span className="text-foreground font-semibold">{cliente.nome}</span></p>}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="text-xs uppercase text-muted-foreground">Endereço</p><p className="text-sm">{SHOP.endereco}</p></div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><p className="text-xs uppercase text-muted-foreground">Horário</p><p className="text-sm">{SHOP.horario}</p></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button onClick={() => navigate("/agendar")} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold uppercase text-primary-foreground active:scale-[0.98]">
          <CalendarPlus className="h-5 w-5" /> Agendar
        </button>
        <button onClick={() => navigate("/meus-agendamentos")} className="flex items-center justify-center gap-2 rounded-xl border border-primary bg-transparent py-4 font-semibold uppercase text-primary active:scale-[0.98]">
          <CalendarClock className="h-5 w-5" /> Meus Agendamentos
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <a href={SHOP.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm active:scale-[0.98]">
          <Instagram className="h-5 w-5 text-primary" /> @{SHOP.instagram}
        </a>
        <a href={whatsappLink(SHOP.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm active:scale-[0.98]">
          <Phone className="h-5 w-5 text-primary" /> WhatsApp
        </a>
      </div>
    </AppShell>
  );
}
