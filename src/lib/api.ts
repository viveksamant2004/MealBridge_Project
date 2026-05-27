import { supabase } from "@/integrations/supabase/client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Automatically gets the token from Supabase session
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Public — no auth needed (e.g. GET /api/donations, GET /api/stats)
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`);
    return res.json();
  },

  // Protected — sends token automatically
  authGet: async (path: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { headers });
    return res.json();
  },

  authPost: async (path: string, body: unknown) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  },

  authPatch: async (path: string, body: unknown) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  },

  authDelete: async (path: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers,
    });
    return res.json();
  },
};