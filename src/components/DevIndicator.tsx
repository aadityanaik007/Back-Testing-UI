"use client";
import { useState, useEffect } from "react";
import config from "../config";

interface DevStatus {
  development_mode: boolean;
  dev_user_id: number;
  message: string;
}

export default function DevIndicator() {
  const [devStatus, setDevStatus] = useState<DevStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDevStatus = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/auth/dev/status`);
        if (response.ok) {
          const data = await response.json();
          setDevStatus(data);
        }
      } catch (error) {
        console.error("Failed to check dev status:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only check dev status in development environment
    if (config.isDevelopment) {
      checkDevStatus();
    } else {
      setLoading(false);
    }
  }, []);

  // Don't show indicator in production or if loading/not dev mode
  if (!config.isDevelopment || loading || !devStatus?.development_mode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
      <div className="flex items-center space-x-2">
        <span>🚀</span>
        <span>DEV MODE - Backend Auth Bypass Active</span>
      </div>
      <div className="text-xs opacity-90 mt-1">{devStatus.message}</div>
    </div>
  );
}
