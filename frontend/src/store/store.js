import { create } from 'zustand';

const initialFilters = {
  city: '',
  property_type: '',
  house_type: '',
  land_factors: [],
  soil_and_infrastructure: [],
  min_price: '',
  max_price: '',
  min_area: '',
  max_area: '',
  bedrooms: '',
  min_bedrooms: '',
  max_bedrooms: '',
  bathrooms: '',
  min_bathrooms: '',
  max_bathrooms: '',
  min_age: '',
  max_age: '',
  min_floors: '',
  max_floors: '',
  min_plot_area: '',
  max_plot_area: '',
  min_fallow_duration: '',
  max_fallow_duration: '',
  min_water_pump_count: '',
  max_water_pump_count: '',
  access_road_type: '',
  corner_plot_status: '',
  solar_grid_integration: '',
  cropping_intensity: '',
  villa_amenities: [],
  sort_by: 'newest',
};

export const useAppStore = create((set) => {
  let initialToken = null;
  let initialUser = null;
  let initialLang = 'en';

  if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem('landlink_token');
    const savedUser = localStorage.getItem('landlink_user');
    if (savedUser) {
      try { initialUser = JSON.parse(savedUser); } catch { /* ignore */ }
    }
    const savedLang = localStorage.getItem('landlink_lang');
    if (savedLang) initialLang = savedLang;
  }

  return {
    // Auth
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,

    // Auth Modal Global Control
    isAuthModalOpen: false,
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),

    setAuth: (token, user) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('landlink_token', token);
        localStorage.setItem('landlink_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true, isAuthModalOpen: false });
    },

    clearAuth: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('landlink_token');
        localStorage.removeItem('landlink_user');
      }
      set({ token: null, user: null, isAuthenticated: false, threads: [], chatMessages: [], activeChatUser: null });
    },

    updateUser: (updatedUser) => {
      set((state) => {
        if (!state.user) return state;
        const newProfile = { ...state.user, ...updatedUser };
        if (typeof window !== 'undefined') {
          localStorage.setItem('landlink_user', JSON.stringify(newProfile));
        }
        return { user: newProfile };
      });
    },

    // Language (en, hi, te)
    language: initialLang,
    setLanguage: (language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('landlink_lang', language);
      }
      set({ language });
    },

    // Search/Filters
    filters: initialFilters,
    setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    resetFilters: () => set({ filters: initialFilters }),

    // Properties Cache
    properties: [],
    setProperties: (properties) => set({ properties }),

    // Chat
    threads: [],
    setThreads: (threads) => set({ threads }),
    activeChatUser: null,
    setActiveChatUser: (activeChatUser) => set({ activeChatUser }),
    chatMessages: [],
    setChatMessages: (chatMessages) => set({ chatMessages }),
    addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  };
});
