// app/_lib/apiClient.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// ====== TYPES ======
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  department_id: number | null;
  role: "admin" | "manager" | "employee";
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

// ====== DOCUMENT TYPES ======
export type DocumentItem = {
  id: number;
  title: string;
  description?: string | null;
  file_type: string;
  file_size: number;
  access_level: string;
  download_count: number;
  department?: { id: number; name: string } | null;
  category?: { id: number; title: string } | null;
  uploaded_by_user?: { id: number; name: string } | null;
  created_at?: string;
};



type LoginPayload = {
  email: string;
  password: string;
};

// ====== STORAGE KEYS ======
const TOKEN_KEY = "edp_token";
const USER_KEY = "edp_user";

// ====== STORAGE HELPER ======
export function saveAuth(login: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, login.token);
  localStorage.setItem(USER_KEY, JSON.stringify(login.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ====== API CALLS ======
export async function apiLogin(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Login gagal. Sila cuba lagi.";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await res.json()) as LoginResponse;
  return data;
}

// ====== DOCUMENT API ======

export async function getDocuments(params?: { search?: string }) {
  const query =
    params?.search && params.search.trim().length > 0
      ? `?search=${encodeURIComponent(params.search)}`
      : "";

  const json = await apiFetch(`/api/v1/documents${query}`);

  // Support dua format: array terus ATAU { data: [...] }
  const items: DocumentItem[] = Array.isArray(json)
    ? json
    : Array.isArray(json.data)
    ? json.data
    : [];

  return items;
}

// Generic fetch dengan token
export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}