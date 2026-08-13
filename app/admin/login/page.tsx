"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Credenciais inválidas");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      router.push("/admin");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 border border-neutral-800 p-8"
      >
        <h1 className="text-center text-neutral-200 text-lg tracking-[0.3em] uppercase mb-2">
          Admin
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className="w-full bg-transparent border border-neutral-700 text-neutral-200 px-4 py-3 outline-none focus:border-red-700 transition-colors"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full bg-transparent border border-neutral-700 text-neutral-200 px-4 py-3 outline-none focus:border-red-700 transition-colors"
        />

        {error && (
          <p className="text-red-700 text-xs text-center tracking-widest uppercase">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 hover:bg-red-900 disabled:opacity-40 text-neutral-200 py-3 tracking-[0.3em] text-sm uppercase transition-colors border border-neutral-800"
        >
          {loading ? "entrando" : "entrar"}
        </button>
      </form>
    </main>
  );
}
