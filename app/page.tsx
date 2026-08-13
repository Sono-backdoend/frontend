"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import skullAnimation from "@/public/animations/skull.json";

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

// retângulo aproximado da área urbana de Foz do Iguaçu
const FOZ_BOUNDS = {
  latMin: -25.560,
  latMax: -25.470,
  lngMin: -54.590,
  lngMax: -54.520,
};

const FRASES = [
  "As coisas que você possui acabam possuindo você.",
  "Só depois de perder tudo é que somos livres para fazer qualquer coisa.",
  "Você não é seu emprego. Você não é o dinheiro que tem no banco.",
  "Este é o seu tempo de vida acabando, um minuto de cada vez.",
  "Você conheceu a mim no momento mais estranho da sua vida.",
];

function sortearCoordenada() {
  const lat = FOZ_BOUNDS.latMin + Math.random() * (FOZ_BOUNDS.latMax - FOZ_BOUNDS.latMin);
  const lng = FOZ_BOUNDS.lngMin + Math.random() * (FOZ_BOUNDS.lngMax - FOZ_BOUNDS.lngMin);
  return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
}

function gerarEncontro() {
  const dias = 3 + Math.floor(Math.random() * 25);
  const data = new Date();
  data.setDate(data.getDate() + dias);

  const hora = 22 + Math.floor(Math.random() * 3);
  const minuto = Math.random() > 0.5 ? "30" : "00";
  const coord = sortearCoordenada();

  return {
    data: data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }),
    hora: `${String(hora % 24).padStart(2, "0")}:${minuto}`,
    local: `${coord.lat}, ${coord.lng}`,
    coord,
    frase: FRASES[Math.floor(Math.random() * FRASES.length)],
  };
}

function mapaUrl(lat: string, lng: string) {
  const params = [
    `center=${lat},${lng}`,
    "zoom=16",
    "size=600x300",
    "scale=2",
    "maptype=roadmap",
    `markers=color:red%7C${lat},${lng}`,
    "style=feature:all%7Celement:geometry%7Ccolor:0x1a1a1a",
    "style=feature:all%7Celement:labels.text.fill%7Ccolor:0x666666",
    "style=feature:all%7Celement:labels.text.stroke%7Ccolor:0x000000",
    "style=feature:road%7Celement:geometry%7Ccolor:0x2b2b2b",
    "style=feature:water%7Celement:geometry%7Ccolor:0x0d0d0d",
    "style=feature:poi%7Cvisibility:off",
    `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`,
  ];
  return `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}`;
}

export default function Home() {
  const [code, setCode] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("fc_code") ?? "" : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<"login" | "invite">("login");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [encontro, setEncontro] = useState<ReturnType<typeof gerarEncontro> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    const savedCode = localStorage.getItem("fc_code");
    if (savedCode) {
      validateCode(savedCode);
    }
    return () => clearTimeout(timer);
  }, []);

  async function validateCode(codeToValidate: string) {
    // MOCK TEMPORÁRIO — remover quando o backend estiver rodando
    if (codeToValidate.toLowerCase() === "teste") {
      setGuestName("Pac");
      setEncontro(gerarEncontro());
      setPhase("invite");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/invite/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToValidate.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem("fc_code");
        setError("Código inválido. Você não deveria estar aqui.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      localStorage.setItem("fc_code", codeToValidate);
      setGuestName(data.guest.name);
      setEncontro(gerarEncontro());
      setPhase("invite");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!code.trim()) return;
    await validateCode(code);
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 overflow-hidden">

      {/* ACESSO ADMIN */}
      <Link
        href="/admin/login"
        aria-label="Acesso admin"
        className="fixed top-4 right-4 z-50 text-neutral-600 hover:text-red-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z"
          />
          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* LOADING */}
      {isLoading && (
        <>
          <div className="fixed inset-0 z-30 bg-white" />
          <div className="fixed inset-0 z-40 bg-black curtain-down" />
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 pointer-events-none">
            <Lottie animationData={skullAnimation} loop style={{ width: 150, height: 150 }} />
            <div className="w-48 h-1 bg-neutral-900 overflow-hidden">
              <div className="h-full bg-red-800" style={{ animation: "loadingBar 5s linear forwards" }} />
            </div>
          </div>
        </>
      )}

      {/* ESTÁTICA DE TV */}
      <div className="tv-noise" />
      <div className="tv-scanlines" />
      <div className="tv-sweep" />

      {/* LOGIN */}
      {phase === "login" && (
        <div className="relative z-10 flex flex-col items-center gap-8 w-full fade-in">
          <img src="/images/soap.png" alt="" className="w-48 sm:w-64 h-auto flicker" />

          <div className="w-full max-w-xs flex flex-col gap-4">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-transparent border border-neutral-700 text-neutral-200 text-center text-base tracking-[0.4em] px-4 py-3 outline-none focus:border-red-700 transition-colors uppercase ${shake ? "shake" : ""}`}
            />
            {error && <p className="text-red-700 text-xs text-center tracking-widest uppercase">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-neutral-900 hover:bg-red-900 disabled:opacity-40 text-neutral-200 py-3 tracking-[0.3em] text-sm uppercase transition-colors border border-neutral-800"
            >
              {loading ? "verificando" : "entrar"}
            </button>
          </div>
        </div>
      )}

      {/* CONVITE */}
      {phase === "invite" && encontro && (
        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md fade-in-fast">

          <img src="/images/soap.png" alt="" className="w-40 sm:w-56 h-auto flicker" />

          <p className="text-center text-xs tracking-[0.35em] uppercase text-neutral-500">
            primeira regra: você não fala sobre isso
          </p>

          <div className="w-full h-px bg-neutral-800" />

          <p className="text-center text-lg sm:text-xl text-neutral-200">
            <span className="text-red-700 flicker">{guestName}</span>, você foi escolhido.
          </p>

          <div className="w-full flex flex-col gap-3">
            {[
              { label: "DATA", value: encontro.data },
              { label: "HORA", value: encontro.hora },
              { label: "COORDENADAS", value: encontro.local },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-baseline border-b border-neutral-800 pb-2 gap-4">
                <span className="text-[0.65rem] tracking-[0.25em] text-neutral-600 uppercase shrink-0">
                  {item.label}
                </span>
                <span className="text-sm text-neutral-300 text-right">{item.value}</span>
              </div>
            ))}
          </div>

          {/* MAPA */}
          <img
            src={mapaUrl(encontro.coord.lat, encontro.coord.lng)}
            alt=""
            className="w-full grayscale-[0.3] contrast-125"
          />

          <p className="text-center text-sm text-neutral-500 italic max-w-sm leading-relaxed">
            &ldquo;{encontro.frase}&rdquo;
          </p>

          <p className="text-center text-[0.6rem] tracking-[0.3em] uppercase text-neutral-700">
            não traga ninguém · não conte a ninguém
          </p>

        </div>
      )}

    </main>
  );
}