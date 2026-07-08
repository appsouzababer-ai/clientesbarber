import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase, setCliente } from "@/lib/barber";

export default function CadastroPage() {
  const navigate = useNavigate();

  const [f, setF] = useState({
    nome: "",
    whatsapp: "",
    instagram: "",
    admin: false,
    email: "",
    senha: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    const ig = f.instagram.replace(/^@/, "").trim().toLowerCase();

    if (!f.nome.trim() || !f.whatsapp.trim() || !ig) {
      return setError("Preencha nome, WhatsApp e Instagram.");
    }

    if (f.admin && (!f.email.trim() || f.senha.length < 8)) {
      return setError("Admin precisa de email e senha (mínimo 8 caracteres).");
    }

    setLoading(true);

    try {

      // Procura cliente existente
      let { data: cliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("instagram", ig)
        .single();

      // Se não existir, cria
      if (!cliente) {

        const { data, error } = await supabase
          .from("clientes")
          .insert([
            {
              nome: f.nome.trim(),
              whatsapp: f.whatsapp.trim(),
              instagram: ig
            }
          ])
          .select()
          .single();

        if (error) throw error;

        cliente = data;
      }

      // Cadastro administrador
      if (f.admin) {

      const { data: authData, error: authError } =
  await supabase.auth.signUp({
    email: f.email.trim(),
    password: f.senha,
  });

if (authError) throw authError;

// Salva os dados do administrador
const { error: adminError } = await supabase
  .from("admins")
  .insert([
    {
      auth_id: authData.user.id,
      nome: f.nome.trim(),
      whatsapp: f.whatsapp.trim(),
      instagram: ig,
      email: f.email.trim(),
      is_admin: true,
    },
  ]);

if (adminError) throw adminError;

// Guarda o admin na sessão local
localStorage.setItem(
  "souza_admin",
  JSON.stringify({
    auth_id: authData.user?.id,
    nome: f.nome.trim(),
    whatsapp: f.whatsapp.trim(),
    instagram: ig,
    email: f.email.trim(),
    is_admin: true,
  })
);

navigate("/admin");
return;
      }

      setCliente(cliente);

      navigate("/app");

    } catch (err) {

      console.error(err);

      setError(err.message || "Erro ao criar conta.");

    } finally {

      setLoading(false);

    }

  };

  const inputCls =
    "h-12 w-full rounded-xl border border-input bg-card px-3 outline-none placeholder:text-muted-foreground/60";

  return (
    <AppShell title="Criar Conta">
      <form onSubmit={submit} className="space-y-4">

        <Field label="Nome">
          <input
            className={inputCls}
            value={f.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Seu nome"
          />
        </Field>

        <Field label="WhatsApp">
          <input
            className={inputCls}
            value={f.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="88999999999"
            inputMode="tel"
          />
        </Field>

        <Field label="Instagram">
          <input
            className={inputCls}
            value={f.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="@seuinstagram"
            autoCapitalize="none"
          />
        </Field>

        <label className="flex items-center gap-3 rounded-xl border border-input bg-card px-3 py-3">
          <input
            type="checkbox"
            checked={f.admin}
            onChange={(e) => set("admin", e.target.checked)}
            className="h-5 w-5 accent-[hsl(var(--primary))]"
          />
          <span className="text-sm">Sou administrador</span>
        </label>

        {f.admin && (

          <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/5 p-3">

            <p className="text-xs text-muted-foreground">
              Login de administrador por email e senha.
            </p>

            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={f.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="admin@email.com"
              />
            </Field>

            <Field label="Senha">
              <input
                type="password"
                className={inputCls}
                value={f.senha}
                onChange={(e) => set("senha", e.target.value)}
                placeholder="mínimo 8 caracteres"
              />
            </Field>

          </div>

        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Criar conta"
          )}
        </button>

      </form>
    </AppShell>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}