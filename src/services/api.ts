// API service for backend communication
const API_BASE_URL = "http://localhost:8000/api";

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  backtest_completed: boolean;
}

export interface StrategyCreate {
  name: string;
  description?: string;
  config: Record<string, any>;
}

export interface StrategyUpdate {
  name?: string;
  description?: string;
  config?: Record<string, any>;
}

export interface BacktestResult {
  id: string;
  strategy_id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  max_drawdown: number;
  sharpe_ratio: number;
  created_at: string;
}

export interface DashboardStats {
  total_strategies: number;
  total_backtests: number;
  avg_win_rate: number;
  total_pnl: number;
  best_strategy: {
    name: string;
    pnl: number;
    win_rate: number;
  } | null;
  recent_results: Array<{
    id: string;
    strategy_name: string;
    total_pnl: number;
    win_rate: number;
    created_at: string;
  }>;
}

// API utility functions
class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem("access_token");

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // Add development mode header for backend
      "X-Dev-User": "testuser@example.com",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`Making request to: ${API_BASE_URL}${endpoint}`, {
    method: config.method || "GET",
    headers: config.headers,
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    console.log(`Response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error for ${endpoint}:`, errorData);
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    console.log(`Success response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error", 0);
  }
}

// Authentication API
export const authAPI = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ access_token: string; token_type: string }> {
    return makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async signup(userData: SignupData): Promise<User> {
    return makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async logout(): Promise<{ message: string }> {
    return makeRequest("/auth/logout", {
      method: "POST",
    });
  },

  async getCurrentUser(): Promise<User> {
    return makeRequest("/auth/me");
  },
};

// Strategy API
export const strategyAPI = {
  async createStrategy(strategy: StrategyCreate): Promise<Strategy> {
    return makeRequest("/strategies", {
      method: "POST",
      body: JSON.stringify(strategy),
    });
  },

  async getStrategies(): Promise<Strategy[]> {
    return makeRequest("/strategies");
  },

  async getStrategy(id: string): Promise<Strategy> {
    return makeRequest(`/strategies/${id}`);
  },

  async updateStrategy(id: string, updates: StrategyUpdate): Promise<Strategy> {
    return makeRequest(`/strategies/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteStrategy(id: string): Promise<{ message: string }> {
    return makeRequest(`/strategies/${id}`, {
      method: "DELETE",
    });
  },

  async duplicateStrategy(id: string, newName: string): Promise<Strategy> {
    return makeRequest(
      `/strategies/${id}/duplicate?new_name=${encodeURIComponent(newName)}`,
      {
        method: "POST",
      }
    );
  },

  async getTemplates(): Promise<{
    templates: Array<{
      name: string;
      description: string;
      config: Record<string, any>;
    }>;
  }> {
    return makeRequest("/strategies/templates");
  },

  async createFromTemplate(
    templateName: string,
    strategyName: string
  ): Promise<Strategy> {
    return makeRequest("/strategies/from-template", {
      method: "POST",
      body: JSON.stringify({
        template_name: templateName,
        strategy_name: strategyName,
      }),
    });
  },

  async runBacktest(
    id: string
  ): Promise<{ message: string; strategy_id: string }> {
    return makeRequest(`/strategies/${id}/run-backtest`, {
      method: "POST",
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats(): Promise<DashboardStats> {
    return makeRequest("/dashboard/stats");
  },
};

// Backtest Results API
export const backtestAPI = {
  async getResults(): Promise<BacktestResult[]> {
    return makeRequest("/backtest-results");
  },

  async getResult(id: string): Promise<any> {
    return makeRequest(`/backtest-results/${id}`);
  },

  async executeBacktest(data: {
    name: string;
    description?: string;
    config: Record<string, any>;
    start_date: string;
    end_date: string;
  }): Promise<any> {
    return makeRequest("/backtest/execute", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async runBacktestForStrategy(
    strategyId: string,
    data: {
      start_date: string;
      end_date: string;
    }
  ): Promise<any> {
    return makeRequest(`/backtest/run/${strategyId}`, {
      method: "POST",
      body: JSON.stringify({
        strategy_id: strategyId,
        ...data,
      }),
    });
  },
};

export { ApiError };
