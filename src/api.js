import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  withCredentials: true, // send httpOnly refresh-token cookie
});

// Auth helpers used by App.jsx 

// Silent token refresh — relies on httpOnly cookie 
export async function refreshToken() {
  const { data } = await api.post("/api/auth/refresh");
  // Expected: { access_token: string, expires_in: number (seconds) }
  return data;
}

// Fetch the current user's profile 
export async function getMe(token) {
  const { data } = await api.get("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// Attach access token to every request 
// Call this once from App after login so the interceptor picks up the token.
let _token = null;
export function setAuthToken(token) {
  _token = token;
}

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

// Auth endpoints 
export const authApi = {
  login:          (data)  => api.post("/api/auth/login", data),
  register:       (data)  => api.post("/api/auth/register", data),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword:  (data)  => api.post("/api/auth/reset-password", data),
  logout:         ()      => api.post("/api/auth/logout"),
};

// Check-in endpoints 
export const checkInApi = {
  create: (data) => api.post("/api/checkins", data),
  list:   ()     => api.get("/api/checkins"),
  today:  ()     => api.get("/api/checkins/today"),
};

// Users 
export const usersApi = {
  setSobrietyStart: (recoveryStartDate) =>
    api.put("/api/users/me/sobriety-start", { recoveryStartDate }),
};

//  Milestones 
export const milestonesApi = {
  list: () => api.get("/api/milestones"),
};

// Groups 
export const groupsApi = {
  list:       ()               => api.get("/api/groups"),
  mine:       ()                => api.get("/api/groups/mine"),
  categories: ()                => api.get("/api/groups/categories"),
  get:        (id)              => api.get(`/api/groups/${id}`),
  create:     (data)            => api.post("/api/groups", data),
  join:       (id)              => api.post(`/api/groups/${id}/join`),
  leave:      (id)              => api.post(`/api/groups/${id}/leave`),
  delete:     (id)              => api.delete(`/api/groups/${id}`),

  messages: {
    list:   (groupId)               => api.get(`/api/groups/${groupId}/messages`),
    send:   (groupId, text)         => api.post(`/api/groups/${groupId}/messages`, { text }),
    edit:   (groupId, msgId, text)  => api.patch(`/api/groups/${groupId}/messages/${msgId}`, { text }),
    delete: (groupId, msgId)        => api.delete(`/api/groups/${groupId}/messages/${msgId}`),
  },
};

// Journal 
export const journalApi = {
  list:   ()       => api.get("/api/journal"),
  create: (data)   => api.post("/api/journal", data),
  update: (id, d)  => api.put(`/api/journal/${id}`, d),
  delete: (id)     => api.delete(`/api/journal/${id}`),
};

// Resources
export const resourcesApi = {
  list: (params) => api.get("/api/resources", { params }),
};

// Donations 
// STK push is asynchronous on Safaricom's side: initiate() only confirms the
// prompt was sent to the donor's phone. The actual PIN entry happens on their
// device, so the caller (Donations.jsx) polls status() every few seconds
// with the returned checkoutRequestId until it resolves to "success" or
// "failed"/timeout.
export const donationsApi = {
  initiate: (data) => api.post("/api/donations/mpesa/stk-push", data),
  // data: { amount, phone, name, message, anonymous, frequency }
  // -> { checkoutRequestId }

  status: (checkoutRequestId) =>
    api.get(`/api/donations/mpesa/status/${checkoutRequestId}`),
  // -> { status: "pending" | "success" | "failed" }
};

export default api;