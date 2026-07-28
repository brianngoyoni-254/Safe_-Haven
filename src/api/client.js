import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
});

export async function refreshToken() {
  const { data } = await api.post("/auth/refresh");
  return data.data;
}

export async function getMe(token) {
  const { data } = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data;
}

let _token = null;
export function setAuthToken(token) {
  _token = token;
}

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

export default api;