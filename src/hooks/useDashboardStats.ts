"use client";
import { useState, useEffect, useCallback } from "react";
import { dashboardAPI, DashboardStats, ApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load dashboard stats");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refetch: loadStats };
}
