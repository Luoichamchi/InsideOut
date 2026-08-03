import type { Transaction, MonthlyConfig, AppSettings } from "../domain/types";

// Same hostname the page was loaded from, so this also works when a phone on
// the LAN opens the dev server via the machine's IP instead of localhost.
// VITE_API_PORT lets a scratch test frontend point at scripts/dev_test_server.sh's
// port (8001) instead of the real backend on 8000 — unset for real usage.
// In a production build with no VITE_API_PORT set, assume nginx proxies /api
// on the same origin (see frontend/nginx.conf) instead of guessing port 8000.
const API_PORT = import.meta.env.VITE_API_PORT;
const BASE =
  import.meta.env.PROD && !API_PORT
    ? "/api"
    : `${window.location.protocol}//${window.location.hostname}:${API_PORT ?? "8000"}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function fetchTransactions(month?: string): Promise<Transaction[]> {
  return request(month ? `/transactions?month=${month}` : "/transactions");
}

export function createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
  return request("/transactions", { method: "POST", body: JSON.stringify(data) });
}

export function updateTransaction(id: number, data: Omit<Transaction, "id">): Promise<Transaction> {
  return request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteTransaction(id: number): Promise<void> {
  return request(`/transactions/${id}`, { method: "DELETE" });
}

export function fetchConfigs(): Promise<MonthlyConfig[]> {
  return request("/config");
}

export function upsertConfig(data: MonthlyConfig): Promise<MonthlyConfig> {
  return request("/config", { method: "PUT", body: JSON.stringify(data) });
}

export function fetchSettings(): Promise<AppSettings> {
  return request("/settings");
}

export function updateSettings(data: AppSettings): Promise<AppSettings> {
  return request("/settings", { method: "PUT", body: JSON.stringify(data) });
}
