"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import Header from "../components/Header";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useDashboardStats();

  // Mock backtesting progress state - replace with real data when available
  const [backtestProgress, setBacktestProgress] = useState({
    isRunning: false,
    progress: 0,
    currentStrategy: "",
    estimatedTime: "",
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Component */}
      <Header activeTab="dashboard" />

      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Trading Dashboard
          </h1>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Dashboard Stats
                </h2>
                {isAuthenticated && (
                  <Link
                    href="/strategies"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Manage →
                  </Link>
                )}
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">
                    Sign in to view your trading statistics
                  </p>
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                </div>
              ) : statsLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading stats...</p>
                </div>
              ) : statsError ? (
                <div className="text-center py-6 text-red-600">
                  <p>Failed to load stats: {statsError}</p>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2">Total P&L</p>
                    <p
                      className={`text-2xl font-bold ${
                        stats.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{stats.total_pnl.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2">
                      Total Strategies
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {stats.total_strategies}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2">Backtests Run</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {stats.total_backtests}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2">Avg Win Rate</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {stats.avg_win_rate.toFixed(1)}%
                    </p>
                  </div>
                  {stats.best_strategy && (
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-2">
                        Best Strategy
                      </p>
                      <p className="font-semibold text-gray-800">
                        {stats.best_strategy.name}
                      </p>
                      <p className="text-sm text-green-600">
                        ₹{stats.best_strategy.pnl.toLocaleString()} (
                        {stats.best_strategy.win_rate.toFixed(1)}% WR)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">
                    No data available. Create your first strategy to get
                    started!
                  </p>
                  <Link
                    href="/strategies"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Create Strategy
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Quick Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capital Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100000"
                    defaultValue="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a strategy...</option>
                    <option value="strategy1">Bull Call Spread</option>
                    <option value="strategy2">Iron Condor</option>
                    <option value="strategy3">Covered Call</option>
                  </select>
                </div>
                <button
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
                  onClick={() =>
                    setBacktestProgress({
                      isRunning: true,
                      progress: 0,
                      currentStrategy: "Bull Call Spread",
                      estimatedTime: "2 minutes",
                    })
                  }
                >
                  Start Backtest
                </button>
                <Link
                  href="/strategies"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium text-center block"
                >
                  Manage Strategies
                </Link>
              </div>
            </div>

            {/* Backtesting Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Backtesting Progress
              </h2>

              {backtestProgress.isRunning ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">
                      Running Strategy:
                    </p>
                    <p className="font-medium text-gray-800">
                      {backtestProgress.currentStrategy}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm text-gray-600">
                        {backtestProgress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${backtestProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Estimated time: {backtestProgress.estimatedTime}</p>
                    <p className="mt-2">Processing market data...</p>
                  </div>

                  <button
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                    onClick={() =>
                      setBacktestProgress({
                        isRunning: false,
                        progress: 0,
                        currentStrategy: "",
                        estimatedTime: "",
                      })
                    }
                  >
                    Stop Backtest
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No active backtests</p>
                  <p className="text-sm text-gray-500">
                    Configure your settings and start a backtest to see progress
                    here
                  </p>
                </div>
              )}

              {/* Recent Results */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Recent Results
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bull Call Spread</span>
                    <span className="text-green-600">+₹15,340</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Iron Condor</span>
                    <span className="text-red-600">-₹8,200</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Covered Call</span>
                    <span className="text-green-600">+₹22,150</span>
                  </div>
                </div>
                <Link
                  href="/backtest-results"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 inline-block"
                >
                  View All Results →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
