const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper para obtener y guardar datos del usuario
export const getUserSession = () => {
  const user = localStorage.getItem("tctd_user");
  return user ? JSON.parse(user) : null;
};

export const setUserSession = (userData: { id: string; role: string; status?: string; [key: string]: any }) => {
  localStorage.setItem("tctd_user", JSON.stringify(userData));
};

export const clearUserSession = () => {
  localStorage.removeItem("tctd_user");
};

// Función principal de peticiones
export async function api_tctd(endpoint: string, method = "GET", body?: any) {
  const user = getUserSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (user && user.id && user.role) {
    headers["x-user-id"] = user.id;
    headers["x-user-role"] = user.role;
    headers["x-user-status"] = user.status || "ACTIVE";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Si la respuesta es exitosa pero no tiene contenido (ej. DELETE), retornamos vacío o true
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
