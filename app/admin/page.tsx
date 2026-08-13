"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/adminApi";
import CreateTab from "./components/CreateTab";
import GuestsTab from "./components/GuestsTab";
import ImportTab from "./components/ImportTab";

type Tab = "create" | "guests" | "import";

const TABS: { key: Tab; label: string }[] = [
  { key: "create", label: "Criar" },
  { key: "guests", label: "Convidados" },
  { key: "import", label: "Importar" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("create");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-600 text-xs tracking-[0.3em] uppercase">carregando</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <h1 className="text-neutral-200 text-lg tracking-[0.3em] uppercase">Admin</h1>

        <nav className="flex gap-2 border-b border-neutral-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-xs tracking-[0.25em] uppercase transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-red-700 text-neutral-200"
                  : "border-transparent text-neutral-600 hover:text-neutral-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "create" && <CreateTab onGuestCreated={() => setRefreshKey((k) => k + 1)} />}
          {tab === "guests" && <GuestsTab refreshKey={refreshKey} />}
          {tab === "import" && <ImportTab onImported={() => setRefreshKey((k) => k + 1)} />}
        </div>
      </div>
    </main>
  );
}
