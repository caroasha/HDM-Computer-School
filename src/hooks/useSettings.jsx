import { useState, useEffect } from 'react';
import api from '../services/api';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      // Settings endpoint is now public, no auth required
      const { data } = await api.get('/settings');
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
      // Don't throw - settings are optional for some pages
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { data } = await api.put('/settings', newSettings);
      setSettings(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, updateSettings, refresh: fetchSettings };
};