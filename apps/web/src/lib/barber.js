import { supabase } from "@/lib/supabase";

export const LOGO =
  "https://horizons-cdn.hostinger.com/bce31fec-2f76-45b7-b2c8-e61f2bc97c96/40caa6f9f16d584a9e5f626f8067a66f.png";

export const SHOP = {
  endereco: "Rua João Cordeiro, 27, Santana do Acaraú-CE",
  horario: "08h-12h / 14h-19h",
  instagram: "souzabarber._",
  instagramUrl: "https://instagram.com/souzabarber._",
  whatsapp: "88999514333",
};

export function whatsappLink(number) {
  const digits = String(number || "").replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

export function instagramLink(handle) {
  const clean = String(handle || "").replace(/^@/, "").trim();
  return `https://instagram.com/${clean}`;
}

// Horários de 50 minutos
export function timeSlots() {
  const out = [];

  const build = (startH, endH) => {
    let mins = startH * 60;
    const end = endH * 60;

    while (mins < end) {
      const h = String(Math.floor(mins / 60)).padStart(2, "0");
      const m = String(mins % 60).padStart(2, "0");
      out.push(`${h}:${m}`);
      mins += 50;
    }
  };

  build(8, 12);
  build(14, 19);

  return out;
}

export function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function displayDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function slotDateTime(iso, hora) {
  return new Date(`${iso}T${hora}:00`);
}

// Sessão do cliente
const KEY = "souza_cliente";

export function getCliente() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function setCliente(cliente) {
  if (cliente) {
    localStorage.setItem(KEY, JSON.stringify(cliente));
  } else {
    localStorage.removeItem(KEY);
  }
}

export function logoutAll() {
  setCliente(null);
}

export { supabase };
