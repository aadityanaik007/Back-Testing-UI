"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { TradingViewIframe } from "../components/TradingViewChart";
import { useDashboardStats } from "../hooks/useDashboardStats";
import Header from "../components/Header";

type TabType = "weekly-monthly" | "monthly-only" | "stocks";

// Weekly & Monthly Expiries Tab Content
function WeeklyMonthlyContent() {
  // New config state for timeFrame and filters
  const indicatorOptions = [
    "Vwap",
    "SMA",
    "EMA",
    "RSI(14)",
    "Bollinger Bands",
    "Candle Body to Wick Ratio",
    "NA",
    "Price",
  ];
  const signOptions = [
    "Greater than",
    "Less than",
    "Greater than or Equal to",
    "Less than or Equal to",
    "Equal To",
    "NA",
  ];

  const [config, setConfig] = useState({
    timeFrame: "",
    filters: [
      {
        indicatorA: indicatorOptions[0],
        valueA: "",
        sign: signOptions[0],
        indicatorB: indicatorOptions[0],
        valueB: "",
      },
    ],
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
        Strategy Configuration
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Frame (in minutes)
          </label>
          <input
            type="number"
            min="1"
            value={config.timeFrame}
            onChange={(e) =>
              setConfig({ ...config, timeFrame: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filters
          </label>
          {config.filters.map((filter, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <select
                value={filter.indicatorA}
                onChange={(e) => {
                  const filters = [...config.filters];
                  filters[idx].indicatorA = e.target.value;
                  setConfig({ ...config, filters });
                }}
                className="border rounded p-1"
              >
                {indicatorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={filter.valueA}
                onChange={(e) => {
                  const filters = [...config.filters];
                  filters[idx].valueA = e.target.value;
                  setConfig({ ...config, filters });
                }}
                className="border rounded p-1 w-16"
                placeholder="A"
              />
              <select
                value={filter.sign}
                onChange={(e) => {
                  const filters = [...config.filters];
                  filters[idx].sign = e.target.value;
                  setConfig({ ...config, filters });
                }}
                className="border rounded p-1"
              >
                {signOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={filter.indicatorB}
                onChange={(e) => {
                  const filters = [...config.filters];
                  filters[idx].indicatorB = e.target.value;
                  setConfig({ ...config, filters });
                }}
                className="border rounded p-1"
              >
                {indicatorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={filter.valueB}
                onChange={(e) => {
                  const filters = [...config.filters];
                  filters[idx].valueB = e.target.value;
                  setConfig({ ...config, filters });
                }}
                className="border rounded p-1 w-16"
                placeholder="B"
              />
              <button
                type="button"
                onClick={() => {
                  const filters = [...config.filters];
                  filters.splice(idx, 1);
                  setConfig({ ...config, filters });
                }}
                className="text-red-500 px-2"
                disabled={config.filters.length === 1}
                title="Remove row"
              >
                –
              </button>
              <button
                type="button"
                onClick={() => {
                  const filters = [...config.filters];
                  filters.splice(idx + 1, 0, {
                    indicatorA: indicatorOptions[0],
                    valueA: "",
                    sign: signOptions[0],
                    indicatorB: indicatorOptions[0],
                    valueB: "",
                  });
                  setConfig({ ...config, filters });
                }}
                className="text-green-500 px-2"
                title="Add row"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Monthly Only Content
function MonthlyOnlyContent() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">
        Monthly Expiries Only configuration coming soon...
      </p>
    </div>
  );
}

// Stocks Content
function StocksContent() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">Stocks configuration coming soon...</p>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("weekly-monthly");
  const { user, logout, isAuthenticated } = useAuth();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useDashboardStats();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Component */}
      <Header activeTab="backtest" />

      <div className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Indian Options Backtesting Tool
          </h1>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex justify-center space-x-8">
              <button
                className={`py-2 px-6 font-semibold rounded-lg transition duration-200 ${
                  activeTab === "weekly-monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab("weekly-monthly")}
              >
                Weekly & Monthly Expiries
              </button>
              <button
                className={`py-2 px-6 font-semibold rounded-lg transition duration-200 ${
                  activeTab === "monthly-only"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab("monthly-only")}
              >
                Monthly Expiries Only
              </button>
              <button
                className={`py-2 px-6 font-semibold rounded-lg transition duration-200 ${
                  activeTab === "stocks"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab("stocks")}
              >
                Stocks
              </button>
            </div>
          </div>

          {/* Tab Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Strategy Configuration Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
                  Strategy Configuration
                </h2>

                {/* Tab Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {activeTab === "weekly-monthly" && <WeeklyMonthlyContent />}
                  {activeTab === "monthly-only" && <MonthlyOnlyContent />}
                  {activeTab === "stocks" && <StocksContent />}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Market Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Market Overview
                  </h2>
                  <Link
                    href="/charts"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Charts →
                  </Link>
                </div>
                <div className="mb-4">
                  <TradingViewIframe
                    symbol="NSE:NIFTY"
                    height={200}
                    theme="light"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">NIFTY 50 - Live Chart</p>
                </div>
              </div>

              {/* Results Section */}
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
                      Manage Strategies →
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
                          stats.total_pnl >= 0
                            ? "text-green-600"
                            : "text-red-600"
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
                      <p className="text-sm text-gray-600 mb-2">
                        Backtests Run
                      </p>
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
                      Capital
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200">
                    Run Backtest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
