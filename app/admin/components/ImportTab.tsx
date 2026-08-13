"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { adminFetch, toISOWithOffset } from "@/lib/adminApi";

const inputClass =
  "w-full bg-transparent border border-neutral-700 text-neutral-200 px-4 py-3 outline-none focus:border-red-700 transition-colors";
const buttonClass =
  "w-full bg-neutral-900 hover:bg-red-900 disabled:opacity-40 text-neutral-200 py-3 tracking-[0.3em] text-sm uppercase transition-colors border border-neutral-800";

type ImportMode = "text" | "file";

type ImportResult = {
  created: number;
  guests: { name: string; code: string }[];
  errors: { name: string; reason: string }[];
};

export default function ImportTab({ onImported }: { onImported: () => void }) {
  const [mode, setMode] = useState<ImportMode>("text");
  const [names, setNames] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [useWindow, setUseWindow] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (useWindow && (!startsAt || !endsAt)) {
      setError("Informe o início e o fim da janela de confirmação");
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      if (mode === "file") {
        if (!file) {
          setError("Selecione um arquivo");
          setLoading(false);
          return;
        }
        const form = new FormData();
        form.append("file", file);
        if (useWindow) {
          form.append("confirmationStartsAt", toISOWithOffset(startsAt));
          form.append("confirmationEndsAt", toISOWithOffset(endsAt));
        }
        res = await adminFetch("/api/admin/guests/import", { method: "POST", body: form });
      } else {
        const nameList = names
          .split(/[\n\r,;]/)
          .map((n) => n.trim())
          .filter(Boolean);

        if (nameList.length === 0) {
          setError("Informe pelo menos um nome");
          setLoading(false);
          return;
        }

        const body: Record<string, unknown> = { names: nameList };
        if (useWindow) {
          body.confirmationStartsAt = toISOWithOffset(startsAt);
          body.confirmationEndsAt = toISOWithOffset(endsAt);
        }

        res = await adminFetch("/api/admin/guests/import", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao importar convidados");
        return;
      }

      setResult(data);
      setNames("");
      setFile(null);
      onImported();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-colors ${
            mode === "text"
              ? "border-red-700 text-neutral-200"
              : "border-neutral-800 text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Colar nomes
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-colors ${
            mode === "file"
              ? "border-red-700 text-neutral-200"
              : "border-neutral-800 text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Enviar arquivo
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          placeholder="Um nome por linha, ou separados por vírgula"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          rows={8}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className={`${inputClass} file:mr-4 file:bg-neutral-900 file:border-0 file:text-neutral-200 file:px-3 file:py-1 file:uppercase file:text-xs file:tracking-widest`}
        />
      )}

      <label className="flex items-center gap-3 text-neutral-400 text-xs tracking-[0.2em] uppercase">
        <input
          type="checkbox"
          checked={useWindow}
          onChange={(e) => setUseWindow(e.target.checked)}
          className="accent-red-700"
        />
        Definir janela de confirmação para todos
      </label>

      {useWindow && (
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">Início</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">Fim</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      )}

      {error && <p className="text-red-700 text-xs text-center tracking-widest uppercase">{error}</p>}

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "importando" : "importar"}
      </button>

      {result && (
        <div className="border border-neutral-800 p-4 flex flex-col gap-2">
          <p className="text-neutral-300 text-sm">
            <span className="text-red-700">{result.created}</span> convidado
            {result.created === 1 ? "" : "s"} criado{result.created === 1 ? "" : "s"}.
          </p>
          {result.errors.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">Falhas</p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-red-700 text-xs">
                  {err.name}: {err.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
