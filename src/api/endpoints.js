import api from "./client.js";

export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    logout: "/api/auth/logout",
    firebase: "/api/auth/firebase",
    refresh: "/api/auth/refresh",
  },
  users: {
    me: "/api/users/me",
    sobrietyStart: "/api/users/me/sobriety-start",
    profile: "/api/users/me/profile",
  },
  checkIns: {
    list: "/api/checkins",
    create: "/api/checkins",
    today: "/api/checkins/today",
  },
  milestones: "/api/milestones",
  dashboard: "/api/dashboard",
  groups: {
    base: "/api/groups",
    categories: "/api/groups/categories",
    mine: "/api/groups/mine",
  },
  journal: "/api/journal",
  resources: "/api/resources",
  crisis: "/api/crisis",
  donations: {
    stkPush: "/api/donations/mpesa/stk-push",
    status: "/api/donations/mpesa/status",
  },
};

export const authApi = {
  login: (data) => api.post(ENDPOINTS.auth.login, data),
  register: (data) => api.post(ENDPOINTS.auth.register, data),
  forgotPassword: (email) => api.post(ENDPOINTS.auth.forgotPassword, { email }),
  resetPassword: (data) => api.post(ENDPOINTS.auth.resetPassword, data),
  logout: () => api.post(ENDPOINTS.auth.logout),
};

export const checkInApi = {
  create: (data) => api.post(ENDPOINTS.checkIns.create, data),
  list: () => api.get(ENDPOINTS.checkIns.list),
  today: () => api.get(ENDPOINTS.checkIns.today),
};

export const usersApi = {
  setSobrietyStart: (recoveryStartDate) =>
    api.put(ENDPOINTS.users.sobrietyStart, { recoveryStartDate }),
  updateProfile: (data) => api.put(ENDPOINTS.users.profile, data),
};

export const milestonesApi = {
  list: () => api.get(ENDPOINTS.milestones),
};

export const dashboardApi = {
  get: () => api.get(ENDPOINTS.dashboard),
};

export const groupsApi = {
  list: () => api.get(ENDPOINTS.groups.base),
  mine: () => api.get(ENDPOINTS.groups.mine),
  categories: () => api.get(ENDPOINTS.groups.categories),
  get: (id) => api.get(`${ENDPOINTS.groups.base}/${id}`),
  create: (data) => api.post(ENDPOINTS.groups.base, data),
  join: (id) => api.post(`${ENDPOINTS.groups.base}/${id}/join`),
  leave: (id) => api.post(`${ENDPOINTS.groups.base}/${id}/leave`),
  delete: (id) => api.delete(`${ENDPOINTS.groups.base}/${id}`),
  messages: {
    list: (groupId) => api.get(`${ENDPOINTS.groups.base}/${groupId}/messages`),
    send: (groupId, text) => api.post(`${ENDPOINTS.groups.base}/${groupId}/messages`, { text }),
    edit: (groupId, msgId, text) =>
      api.patch(`${ENDPOINTS.groups.base}/${groupId}/messages/${msgId}`, { text }),
    delete: (groupId, msgId) =>
      api.delete(`${ENDPOINTS.groups.base}/${groupId}/messages/${msgId}`),
  },
};

export const journalApi = {
  list: () => api.get(ENDPOINTS.journal),
  create: (data) => api.post(ENDPOINTS.journal, data),
  update: (id, data) => api.put(`${ENDPOINTS.journal}/${id}`, data),
  delete: (id) => api.delete(`${ENDPOINTS.journal}/${id}`),
};

export const resourcesApi = {
  list: (params) => api.get(ENDPOINTS.resources, { params }),
};

export const crisisApi = {
  list: () => api.get(ENDPOINTS.crisis),
};

export const donationsApi = {
  initiate: (data) => api.post(ENDPOINTS.donations.stkPush, data),
  status: (checkoutRequestId) =>
    api.get(`${ENDPOINTS.donations.status}/${checkoutRequestId}`),
};

export default api;