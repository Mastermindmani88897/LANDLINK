import { useAppStore } from '../store/store';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('landlink_token') : null;

  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch { /* ignore */ }
    throw new Error(errorDetail);
  }

  if (response.status === 204) return {};
  return response.json();
}

export const api = {
  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  async login(payload) {
    const data = await apiFetch('/auth/login-json', { method: 'POST', body: JSON.stringify(payload) });
    const profile = await apiFetch('/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } });
    useAppStore.getState().setAuth(data.access_token, profile);
    return { token: data.access_token, user: profile };
  },

  async register(payload) {
    return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },

  async googleLogin(payload) {
    const data = await apiFetch('/auth/google-login', { method: 'POST', body: JSON.stringify(payload) });
    const profile = await apiFetch('/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } });
    useAppStore.getState().setAuth(data.access_token, profile);
    return { token: data.access_token, user: profile };
  },

  async getMe() {
    const profile = await apiFetch('/auth/me');
    useAppStore.getState().updateUser(profile);
    return profile;
  },

  async updateMe(payload) {
    const profile = await apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(payload) });
    useAppStore.getState().updateUser(profile);
    return profile;
  },

  // ─── PROPERTIES ────────────────────────────────────────────────────────────
  async searchProperties(filters) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (item) params.append(key, item);
        });
      } else if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const data = await apiFetch(`/properties/?${params.toString()}`);
    useAppStore.getState().setProperties(data);
    return data;
  },

  async getProperty(id) { return apiFetch(`/properties/${id}`); },

  async createProperty(payload) {
    return apiFetch('/properties/', { method: 'POST', body: JSON.stringify(payload) });
  },

  async updateProperty(id, payload) {
    return apiFetch(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  async deleteProperty(id) {
    return apiFetch(`/properties/${id}`, { method: 'DELETE' });
  },

  async getMyListings() {
    return apiFetch('/properties/my-listings');
  },

  async getFavorites() {
    return apiFetch('/properties/favorites/all');
  },

  async toggleFavorite(id) {
    return apiFetch(`/properties/${id}/favorite`, { method: 'POST' });
  },

  async addFavorite(id) {
    return apiFetch(`/properties/${id}/favorite`, { method: 'POST' });
  },

  async removeFavorite(id) {
    return apiFetch(`/properties/${id}/favorite`, { method: 'POST' });
  },

  async scheduleVisit(propertyId, visitDate, notes) {
    return apiFetch(`/properties/${propertyId}/visit`, {
      method: 'POST', body: JSON.stringify({ property_id: propertyId, visit_date: visitDate, notes }),
    });
  },

  async replyVisit(visitId, status, sellerReply) {
    return apiFetch(`/properties/visit/${visitId}/reply`, {
      method: 'PUT', body: JSON.stringify({ status, seller_reply: sellerReply }),
    });
  },

  async submitOffer(propertyId, offerAmount, notes) {
    return apiFetch(`/properties/${propertyId}/offers`, {
      method: 'POST', body: JSON.stringify({ property_id: propertyId, offer_amount: offerAmount, notes }),
    });
  },

  async submitReview(propertyId, payload) {
    return apiFetch(`/properties/${propertyId}/reviews`, {
      method: 'POST', body: JSON.stringify({ property_id: propertyId, ...payload }),
    });
  },

  async getPropertyReviews(propertyId) {
    return apiFetch(`/properties/${propertyId}/reviews`);
  },

  // ─── CHAT ──────────────────────────────────────────────────────────────────
  async getThreads() {
    const data = await apiFetch('/chat/threads');
    useAppStore.getState().setThreads(data);
    return data;
  },

  async getChatHistory(targetUserId) {
    const data = await apiFetch(`/chat/history/${targetUserId}`);
    useAppStore.getState().setChatMessages(data);
    return data;
  },

  async sendMessage(payload) {
    const data = await apiFetch('/chat/', { method: 'POST', body: JSON.stringify(payload) });
    useAppStore.getState().addChatMessage(data);
    return data;
  },

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  async getDashboard() { return apiFetch('/dashboard'); },
  async getSellerDashboard() { return apiFetch('/dashboard'); },
  async getBuyerDashboard() { return apiFetch('/dashboard'); },

  // ─── AI UTILITIES ──────────────────────────────────────────────────────────
  async aiGenerateDescription(payload) {
    return apiFetch('/properties/ai/generate-description', { method: 'POST', body: JSON.stringify(payload) });
  },
  async aiImageAnalysis(imageUrls) {
    return apiFetch('/properties/ai/image-analysis', { method: 'POST', body: JSON.stringify({ image_urls: imageUrls }) });
  },
  async aiPricePrediction(payload) {
    return apiFetch('/properties/ai/price-prediction', { method: 'POST', body: JSON.stringify(payload) });
  },
  async aiNegotiation(payload) {
    return apiFetch('/properties/ai/negotiate', { method: 'POST', body: JSON.stringify(payload) });
  },
  async aiInteriorSuggestions(imageUrls) {
    return apiFetch('/properties/ai/interior-suggestions', { method: 'POST', body: JSON.stringify({ image_urls: imageUrls }) });
  },
  async aiNeighborhoodAnalysis(propertyId) {
    return apiFetch(`/properties/${propertyId}/ai/neighborhood`);
  },
  async aiInvestmentAnalysis(propertyId) {
    return apiFetch(`/properties/${propertyId}/ai/investment`);
  },
  async aiChatAssistant(propertyId, question, history = []) {
    return apiFetch(`/properties/${propertyId}/ai/chat`, {
      method: 'POST', body: JSON.stringify({ property_id: propertyId, question, chat_history: history }),
    });
  },

  // ─── ADMIN SERVICES ────────────────────────────────────────────────────────
  async adminLogin(payload) {
    const data = await apiFetch('/auth/admin/login', { method: 'POST', body: JSON.stringify(payload) });
    useAppStore.getState().setAuth(data.access_token, data.user);
    return data;
  },

  async getAdminStats() {
    return apiFetch('/admin/stats');
  },

  async getAdminProperties() {
    return apiFetch('/admin/properties');
  },

  async updateAdminPropertyStatus(id, payload) {
    return apiFetch(`/admin/properties/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  async deleteAdminProperty(id) {
    return apiFetch(`/admin/properties/${id}`, { method: 'DELETE' });
  },

  async getAdminUsers() {
    return apiFetch('/admin/users');
  },
};
