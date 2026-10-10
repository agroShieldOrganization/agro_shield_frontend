import axios from "axios";

const apiBaseUrl = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8001"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// VERY IMPORTANT:
// Laravel stores the cookie URL-encoded.
// We must decode it before sending it back.
function getXsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : null;
}

export async function initializeCsrfProtection() {
  await api.get("/sanctum/csrf-cookie");

  const token = getXsrfToken();

  if (token) {
    api.defaults.headers.common["X-XSRF-TOKEN"] = token;
  }
}

export default api;