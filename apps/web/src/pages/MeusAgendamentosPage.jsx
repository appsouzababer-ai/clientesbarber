import React, { useEffect, useState } from "react";
import { Trash2, Pencil, CalendarX, Loader2, X, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase, getCliente, displayDate, slotDateTime, timeSlots } from "@/lib/barber";

export default function MeusAgendamentosPage() {
  const cliente = getCliente();

  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);
  const [taken, setTaken] = useState([]);
  const [hora, setHora] = useState("");
  const [obs, setObs] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("cliente_instagram", cliente.instagram)
      .order("data", { ascending: false });

    if (error) setList([]);
    else setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const editable = (a) =>
    slotDateTime(a.data, a.hora).getTime() - Date.now() >
    2 * 60 * 60 * 1000;

  const remove = async (a) => {
    if (!editable(a)) return;
    if (!window.confirm("Excluir este agendamento?")) return;

    await supabase
      .from("agendamentos")
      .delete()
      .eq("id", a.id);

    load();
  };

  const openEdit = async (a) => {
    setEditing(a);
    setHora(a.hora);
    setObs(a.observacoes || "");

    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("data", a.data);

    setTaken(
      (data || [])
        .filter((x) => x.id !== a.id)
        .map((x) => x.hora)
    );
  };

  const saveEdit = async () => {
    setBusy(true);

    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({
          hora,
          observacoes: obs.trim(),
        })
        .eq("id", editing.id);

      if (error) throw error;

      setEditing(null);
      load();
    } catch {
      window.alert("Horário indisponível.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Meus Agendamentos">
      {list === null && (
        <div className="flex justify-center pt-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {list && list.length === 0 && (
        <div className="flex flex-col items-center pt-16 text-center text-muted-foreground">
          <CalendarX className="h-12 w-12" />
          <p className="mt-3">Nenhum agendamento ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {list?.map((a) => {
          const ed = editable(a);

          return (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl uppercase">
                  {a.servico}
                </span>

                <span className="text-primary font-semibold">
                  R$ {a.preco}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {displayDate(a.data)} às {a.hora}
              </p>

              {a.observacoes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Obs: {a.observacoes}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  disabled={!ed}
                  onClick={() => openEdit(a)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm disabled:opacity-30"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>

                <button
                  disabled={!ed}
                  onClick={() => remove(a)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-destructive/50 text-destructive py-2 text-sm disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>

              {!ed && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Alterações só até 2h antes do horário.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-6 pb-10 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase">
                Editar
              </h2>

              <button
                onClick={() => setEditing(null)}
                className="rounded-full bg-secondary p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              {displayDate(editing.data)} — novo horário
            </p>

            <div className="grid grid-cols-3 gap-2">
              {timeSlots().map((h) => {
                const dis = taken.includes(h);

                return (
                  <button
                    key={h}
                    disabled={dis}
                    onClick={() => setHora(h)}
                    className={`rounded-lg py-3 text-sm ${
                      dis
                        ? "bg-secondary/40 text-muted-foreground/30 line-through"
                        : hora === h
                        ? "bg-primary text-primary-foreground"
                        : "bg-background active:scale-95"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Observações"
              className="mt-4 w-full rounded-xl border border-input bg-background p-3 outline-none"
            />

            <button
              disabled={busy}
              onClick={saveEdit}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}