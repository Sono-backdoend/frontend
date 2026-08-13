const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(apiUrl(path), { ...options, headers });
}

// Converte o valor de um <input type="datetime-local"> (sem timezone) para
// ISO-8601 com o offset local, ex: "2026-08-07T14:00:00-03:00"
export function toISOWithOffset(dateTimeLocal: string): string {
  const date = new Date(dateTimeLocal);
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const pad = (n: number) => String(n).padStart(2, "0");
  const offset = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00${offset}`
  );
}

export type GuestResponseInfo = {
  confirmed: boolean;
  plusOne: boolean;
  plusOneName: string | null;
  plusOnePhone: string | null;
  respondedAt: string | null;
} | null;

export type Guest = {
  id: string;
  name: string;
  code: string;
  confirmationStartsAt: string | null;
  confirmationEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  response: GuestResponseInfo;
};

export type Admin = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
