"use client";

import { useState, FormEvent } from "react";
import Modal from "./Modal";
import { adminFetch, toISOWithOffset } from "@/lib/adminApi";

const inputClass =
  "w-full bg-transparent border border-neutral-700 text-neutral-200 px-4 py-3 outline-none focus:border-red-700 transition-colors";
const buttonClass =
  "w-full bg-neutral-900 hover:bg-red-900 disabled:opacity-40 text-neutral-200 py-3 tracking-[0.3em] text-sm uppercase transition-colors border border-neutral-800";

type ModalKind = "guest" | "temp-guest" | "admin" | null;

export default function CreateTab({ onGuestCreated }: { onGuestCreated: () => void }) {
  const [openModal, setOpenModal] = useState<ModalKind>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setOpenModal("guest")}
          className="bg-neutral-900 hover:bg-red-900 text-neutral-200 px-5 py-3 tracking-[0.2em] text-xs uppercase transition-colors border border-neutral-800"
        >
          Criar Convite
        </button>
        <button
          onClick={() => setOpenModal("temp-guest")}
          className="bg-neutral-900 hover:bg-red-900 text-neutral-200 px-5 py-3 tracking-[0.2em] text-xs uppercase transition-colors border border-neutral-800"
        >
          Criar Convite Temporário
        </button>
        <button
          onClick={() => setOpenModal("admin")}
          className="bg-neutral-900 hover:bg-red-900 text-neutral-200 px-5 py-3 tracking-[0.2em] text-xs uppercase transition-colors border border-neutral-800"
        >
          Criar Usuário Admin
        </button>
      </div>

      <GuestModal
        open={openModal === "guest"}
        temporary={false}
        onClose={() => setOpenModal(null)}
        onCreated={onGuestCreated}
      />
      <GuestModal
        open={openModal === "temp-guest"}
        temporary
        onClose={() => setOpenModal(null)}
        onCreated={onGuestCreated}
      />
      <AdminModal open={openModal === "admin"} onClose={() => setOpenModal(null)} />
    </div>
  );
}

function GuestModal({
  open,
  temporary,
  onClose,
  onCreated,
}: {
  open: boolean;
  temporary: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ name: string; code: string } | null>(null);

  function reset() {
    setName("");
    setStartsAt("");
    setEndsAt("");
    setError("");
    setCreated(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (temporary && (!startsAt || !endsAt)) {
      setError("Informe o início e o fim da janela de confirmação");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (temporary) {
        body.confirmationStartsAt = toISOWithOffset(startsAt);
        body.confirmationEndsAt = toISOWithOffset(endsAt);
      }

      const res = await adminFetch("/api/admin/guests", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar convidado");
        return;
      }

      setCreated({ name: data.name, code: data.code });
      onCreated();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={temporary ? "Convite Temporário" : "Criar Convite"}>
      {created ? (
        <div className="flex flex-col gap-4">
          <p className="text-neutral-300 text-sm">
            Convite criado para <span className="text-red-700">{created.name}</span>.
          </p>
          <div className="border border-neutral-800 px-4 py-3 flex items-center justify-between gap-4">
            <span className="text-neutral-500 text-xs tracking-[0.2em] uppercase">Código</span>
            <span className="text-neutral-200 tracking-[0.3em] uppercase">{created.code}</span>
          </div>
          <button onClick={handleClose} className={buttonClass}>
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome do convidado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />

          {temporary && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">
                  Início da confirmação
                </span>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-neutral-500 text-[0.65rem] tracking-[0.2em] uppercase">
                  Fim da confirmação
                </span>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                  className={inputClass}
                />
              </label>
            </>
          )}

          {error && (
            <p className="text-red-700 text-xs text-center tracking-widest uppercase">{error}</p>
          )}

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "criando" : "criar"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function AdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/admins", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar admin");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Criar Usuário Admin">
      {success ? (
        <div className="flex flex-col gap-4">
          <p className="text-neutral-300 text-sm">
            Admin <span className="text-red-700">{name}</span> criado com sucesso.
          </p>
          <button onClick={handleClose} className={buttonClass}>
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass}
          />

          {error && (
            <p className="text-red-700 text-xs text-center tracking-widest uppercase">{error}</p>
          )}

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "criando" : "criar"}
          </button>
        </form>
      )}
    </Modal>
  );
}
