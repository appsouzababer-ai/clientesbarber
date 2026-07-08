import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserCog, Instagram, Loader2, X } from "lucide-react";
import { LOGO, setCliente, supabase } from "@/lib/barber";

export default function LoginPage() {
  const navigate = useNavigate();

  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [adminOpen, setAdminOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aErr, setAErr] = useState("");
  const [aLoading, setALoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setError("");

    const ig = instagram.replace("@", "").trim().toLowerCase();

    if (!ig) {
      setError("Informe seu Instagram.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("instagram", ig)
        .single();

      if (error || !data) {
        setError("Conta não encontrada. Crie sua conta.");
      } else {
        setCliente(data);
        navigate("/app");
      }
    } catch {
      setError("Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (e) => {
  e.preventDefault();
  setAErr("");
  setALoading(true);

  try {
    // Login pelo Supabase Auth
const { error: authError } =
  await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

    if (authError) throw authError;

    // Busca os dados do administrador
    const { data: admin, error } = await supabase
  .from("admins")
  .select("*")
  .eq("email", email)
  .single();

    if (error || !admin) {
      setAErr("Administrador não encontrado.");
      return;
    }

    if (!admin.is_admin) {
      setAErr("Esta conta não possui permissão.");
      return;
    }

    localStorage.setItem("souza_admin", JSON.stringify(admin));

    navigate("/admin");

  } catch (err) {
    setAErr("Email ou senha inválidos.");
  } finally {
    setALoading(false);
  }
};

  return (
    <div
      className="app-frame flex flex-col items-center px-6 pb-10"
      style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}
    >
      <button
        onClick={() => setAdminOpen(true)}
        aria-label="Admin"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition active:scale-95"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <UserCog className="h-5 w-5" />
      </button>

      <img
        src={LOGO}
        alt="Souza Barbershop"
        className="mt-8 h-40 w-40 rounded-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.6)]"
      />

      <h1 className="mt-4 font-display text-4xl uppercase tracking-wide">
        Souza Barbershop
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Desde 2025
      </p>

      <form onSubmit={entrar} className="mt-10 w-full space-y-3">

        <label className="block text-sm font-medium text-muted-foreground">
          Instagram
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3">
          <Instagram className="h-5 w-5 text-primary" />

          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@seuinstagram"
            autoCapitalize="none"
            className="h-12 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold uppercase tracking-wide text-primary-foreground active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : "Entrar"}
        </button>

      </form>

      <Link
        to="/cadastro"
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
      >
        Criar conta
      </Link>

      {adminOpen && (

        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 sm:items-center">

          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-6 pb-10 sm:rounded-3xl">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="font-display text-2xl uppercase">
                Acesso Admin
              </h2>

              <button
                onClick={() => setAdminOpen(false)}
                className="rounded-full bg-secondary p-2"
              >
                <X className="h-5 w-5"/>
              </button>

            </div>

            <form onSubmit={adminLogin} className="space-y-3">

              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Email"
                className="h-12 w-full rounded-xl border border-input bg-background px-3 outline-none"
              />

              <input
                type="password"
                value={senha}
                onChange={(e)=>setSenha(e.target.value)}
                placeholder="Senha"
                className="h-12 w-full rounded-xl border border-input bg-background px-3 outline-none"
              />

              {aErr &&
                <p className="text-sm text-destructive">
                  {aErr}
                </p>
              }

              <button
                type="submit"
                disabled={aLoading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold uppercase text-primary-foreground active:scale-[0.98] disabled:opacity-60"
              >
                {aLoading
                  ? <Loader2 className="h-5 w-5 animate-spin"/>
                  : "Entrar como Admin"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}