"use client";

import { useEffect, useState } from "react";
import { adminFetch, Guest } from "@/lib/adminApi";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function confirmationLabel(guest: Guest) {
  if (!guest.response) return "Pendente";
  return guest.response.confirmed ? "Confirmado" : "Recusado";
}

export default function GuestsTab({ refreshKey }: { refreshKey: number }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/guests");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao carregar convidados");
        return;
      }
      setGuests(data);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase">
          {guests.length} convidado{guests.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="text-neutral-500 hover:text-red-700 disabled:opacity-40 text-xs tracking-[0.2em] uppercase transition-colors"
        >
          {loading ? "atualizando" : "atualizar"}
        </button>
      </div>

      {error && (
        <p className="text-red-700 text-xs text-center tracking-widest uppercase">{error}</p>
      )}

      <div className="overflow-x-auto border border-neutral-800">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acompanhante</th>
              <th className="px-4 py-3">Acessos</th>
              <th className="px-4 py-3">Janela</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-b border-neutral-900 text-neutral-300">
                <td className="px-4 py-3">{guest.name}</td>
                <td className="px-4 py-3 uppercase tracking-widest text-neutral-500">{guest.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      guest.response?.confirmed
                        ? "text-neutral-200"
                        : guest.response
                          ? "text-red-700"
                          : "text-neutral-600"
                    }
                  >
                    {confirmationLabel(guest)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {guest.response?.plusOne ? guest.response.plusOneName ?? "Sim" : "—"}
                </td>
                <td className="px-4 py-3">{guest.accessCount}</td>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                  {guest.confirmationStartsAt
                    ? `${formatDate(guest.confirmationStartsAt)} — ${formatDate(guest.confirmationEndsAt)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{formatDate(guest.createdAt)}</td>
              </tr>
            ))}
            {!loading && guests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-neutral-600 text-xs tracking-widest uppercase">
                  Nenhum convidado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
