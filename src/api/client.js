import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
});

let _token = null;
export function setAuthToken(token) {
  _token = token;
}

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

export async function refreshToken() {
  const { data } = await api.post("/auth/refresh");
  return data.data;
}

// No longer takes a token param — relies on the interceptor above,
// so it always uses whatever setAuthToken() last set. This removes
// the second, easy-to-desync code path for attaching the auth header.
export async function getMe() {
  const { data } = await api.get("/users/me");
  return data.data;
}

export default api;