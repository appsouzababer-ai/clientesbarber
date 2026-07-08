import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AppShell({ title, showBack = true, right, children }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="app-frame flex flex-col text-foreground">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {showBack ? (
          <button
            onClick={goBack}
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
        ) : (
          <span className="h-10 w-10" />
        )}
        <h1 className="flex-1 truncate text-center font-display text-2xl uppercase tracking-wide">
          {title}
        </h1>
        <div className="flex h-10 w-10 items-center justify-center">{right}</div>
      </header>
      <main className="flex-1 px-4 pb-10 pt-4 animate-slide-up"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
        {children}
      </main>
    </div>
  );
}
