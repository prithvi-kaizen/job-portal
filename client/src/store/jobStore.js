import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:5001/api';

export const useJobStore = create((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async (search = '', location = '') => {
    set({ isLoading: true, error: null });
    try {
        let qs = new URLSearchParams();
        if (search) qs.append('search', search);
        if (location) qs.append('location', location);
        
        const res = await fetch(`${API_URL}/jobs?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        set({ jobs: data, isLoading: false });
    } catch (error) {
        set({ error: error.message, isLoading: false });
    }
  },

  createJob: async (jobData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      set(state => ({ jobs: [data, ...state.jobs], isLoading: false }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
