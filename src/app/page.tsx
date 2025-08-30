"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { TradingViewIframe } from "../components/TradingViewChart";
import { useDashboardStats } from "../hooks/useDashboardStats";

type TabType = "weekly-monthly" | "monthly-only" | "stocks";

// Weekly & Monthly Expiries Tab Content
function WeeklyMonthlyContent() {
  const [underlyingFrom, setUnderlyingFrom] = useState("cash");
  const [strategyType, setStrategyType] = useState("intraday");
  const [noReentry, setNoReentry] = useState(false);
  const [overallMomentum, setOverallMomentum] = useState(false);
  const [squareOff, setSquareOff] = useState("partial");
  const [trailSL, setTrailSL] = useState(false);
  const [trailSLType, setTrailSLType] = useState("all-legs");
  const [segment, setSegment] = useState("options");
  const [position, setPosition] = useState("buy");

  return (
    <div className="space-y-8">
      {/* Instrument Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
          Instrument Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scrip
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>NIFTY 50</option>
              <option>BANKNIFTY</option>
              <option>FINNIFTY</option>
              <option>SENSEX</option>
              <option>BANKEX</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Underlying From
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underlyingFrom"
                    checked={underlyingFrom === "cash"}
                    onChange={() => setUnderlyingFrom("cash")}
                    className="mr-2"
                  />
                  Cash
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underlyingFrom"
                    checked={underlyingFrom === "futures"}
                    onChange={() => setUnderlyingFrom("futures")}
                    className="mr-2"
                  />
                  Futures
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strategy Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategyType"
                    checked={strategyType === "intraday"}
                    onChange={() => setStrategyType("intraday")}
                    className="mr-2"
                  />
                  Intraday
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategyType"
                    checked={strategyType === "btst"}
                    onChange={() => setStrategyType("btst")}
                    className="mr-2"
                  />
                  BTST
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
          Entry Settings
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Time
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="09:20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Entry Time
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="14:50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Time
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="15:15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Expiry Exit Time
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="15:10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Expiry Exit Time
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="15:10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={noReentry}
                onChange={(e) => setNoReentry(e.target.checked)}
                className="mr-2"
              />
              No Re-entry
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={overallMomentum}
                onChange={(e) => setOverallMomentum(e.target.checked)}
                className="mr-2"
              />
              Overall Momentum
            </label>
          </div>
        </div>
      </div>

      {/* Legwise Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
          Legwise Settings
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Off (Common)
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="squareOff"
                    checked={squareOff === "partial"}
                    onChange={() => setSquareOff("partial")}
                    className="mr-2"
                  />
                  Partial
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="squareOff"
                    checked={squareOff === "individual"}
                    onChange={() => setSquareOff("individual")}
                    className="mr-2"
                  />
                  Individual
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trailing SL
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={trailSL}
                    onChange={(e) => setTrailSL(e.target.checked)}
                    className="mr-2"
                  />
                  Enable Trailing SL
                </label>
                {trailSL && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="trailSLType"
                        checked={trailSLType === "all-legs"}
                        onChange={() => setTrailSLType("all-legs")}
                        className="mr-2"
                      />
                      All Legs
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="trailSLType"
                        checked={trailSLType === "individual-legs"}
                        onChange={() => setTrailSLType("individual-legs")}
                        className="mr-2"
                      />
                      Individual Legs
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leg Builder */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
          Leg Builder
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="options">Options</option>
                <option value="futures">Futures</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option Type
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="ce">CE (Call)</option>
                <option value="pe">PE (Put)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="current_week">Current Week</option>
                <option value="next_week">Next Week</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strike Selection
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="atm">ATM</option>
                <option value="closest_premium">Closest Premium</option>
                <option value="strike_type">Strike Type</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lots
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="1"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
                Add Leg
              </button>
            </div>
          </div>
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
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Options Backtester
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link
                  href="/"
                  className="text-blue-600 font-medium border-b-2 border-blue-600"
                >
                  Backtest
                </Link>
                <Link
                  href="/strategies"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Strategies
                </Link>
                <Link
                  href="/charts"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Charts
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

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
