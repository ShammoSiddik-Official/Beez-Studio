const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("beez_admin_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...authHeaders(), ...(init?.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  setupStatus: () => request<{ setupRequired: boolean }>("/admin/auth/setup-status"),
  setup: (setupToken: string, username: string, password: string, displayName?: string) =>
    request<{ token: string; user: AdminUser }>("/admin/auth/setup", {
      method: "POST",
      body: JSON.stringify({ setupToken, username, password, displayName }),
    }),
  resetPassword: (setupToken: string, username: string, password: string) =>
    request<{ success: boolean }>("/admin/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ setupToken, username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ token: string; user: AdminUser }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<AdminUser>("/admin/auth/me"),
  stats: () => request<Stats>("/admin/stats"),
  contacts: {
    list: () => request<Contact[]>("/admin/contacts"),
    delete: (id: number) => request<{ success: boolean }>(`/admin/contacts/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => request<Project[]>("/admin/projects"),
    create: (data: ProjectInput) => request<Project>("/admin/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ProjectInput>) => request<Project>(`/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/admin/projects/${id}`, { method: "DELETE" }),
  },
  users: {
    list: () => request<AdminUser[]>("/admin/users"),
    create: (data: UserInput) => request<AdminUser>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<UserInput>) => request<AdminUser>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
  },
};

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
  role: "root" | "editor";
  displayName: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  year: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface ProjectInput {
  title: string;
  category: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  year?: string;
  featured?: boolean;
  published?: boolean;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  role: "root" | "editor";
  displayName?: string;
}

export interface Stats {
  totalContacts: number;
  totalProjects: number;
  totalUsers: number;
  recentContacts: Contact[];
}
