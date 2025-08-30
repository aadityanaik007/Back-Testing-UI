"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, Strategy, ApiError } from "../../../services/api";

export default function StrategyDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const strategyId = parseInt(params.id as string);

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    config: {} as Record<string, any>,
  });

  // Default strategy config fields
  const configFields = [
    { key: "ema9", label: "EMA 9", type: "number", default: 9 },
    { key: "ema5", label: "EMA 5", type: "number", default: 5 },
    { key: "ema13", label: "EMA 13", type: "number", default: 13 },
    { key: "ema21", label: "EMA 21", type: "number", default: 21 },
    { key: "ema34", label: "EMA 34", type: "number", default: 34 },
    { key: "sma40", label: "SMA 40", type: "number", default: 40 },
    { key: "ema40", label: "EMA 40", type: "number", default: 40 },
    { key: "sma45", label: "SMA 45", type: "number", default: 45 },
    { key: "sma50", label: "SMA 50", type: "number", default: 50 },
    { key: "sma100", label: "SMA 100", type: "number", default: 100 },
    { key: "sma200", label: "SMA 200", type: "number", default: 200 },
    { key: "sma300", label: "SMA 300", type: "number", default: 300 },
    { key: "rsi14", label: "RSI Period", type: "number", default: 14 },
    {
      key: "rsi_threshold",
      label: "RSI Threshold",
      type: "number",
      default: 50,
    },
    {
      key: "body_ratio",
      label: "Body Ratio",
      type: "number",
      step: "0.1",
      default: 0.6,
    },
    { key: "sell_otm", label: "Sell OTM", type: "number", default: 0 },
    { key: "spread", label: "Spread", type: "number", default: 200 },
    { key: "lot_size", label: "Lot Size", type: "number", default: 50 },
    {
      key: "max_profit_per_lot",
      label: "Max Profit per Lot",
      type: "number",
      default: 100,
    },
    {
      key: "spot_sl_pct",
      label: "Spot SL %",
      type: "number",
      step: "0.001",
      default: 0.003,
    },
    {
      key: "max_hold",
      label: "Max Hold (minutes)",
      type: "number",
      default: 210,
    },
    { key: "min_premium", label: "Min Premium", type: "number", default: 30 },
  ];

  useEffect(() => {
    if (isAuthenticated && strategyId) {
      loadStrategy();
    }
  }, [isAuthenticated, strategyId]);

  const loadStrategy = async () => {
    try {
      setLoading(true);
      const data = await strategyAPI.getStrategy(strategyId);
      setStrategy(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        config: data.config,
      });
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load strategy");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await strategyAPI.updateStrategy(strategyId, formData);
      setSuccessMessage("Strategy updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update strategy");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this strategy? This action cannot be undone."
      )
    ) {
      try {
        await strategyAPI.deleteStrategy(strategyId);
        router.push("/strategies");
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete strategy");
        }
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please log in to edit strategies.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Options Backtester
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 ml-4">Loading strategy...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Options Backtester
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Strategy Not Found</h2>
            <p className="text-gray-600 mb-4">
              The strategy you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link
              href="/strategies"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Strategies
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Backtest
                </Link>
                <Link href="/strategies" className="text-blue-600 font-medium">
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
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link
                href="/strategies"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Strategies
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Strategy
              </h1>
              <p className="text-gray-600 mt-2">
                Configure your strategy parameters
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/backtest?strategy=${strategyId}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Run Backtest
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Strategy Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description of your strategy..."
                  />
                </div>
              </div>
            </div>

            {/* Strategy Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Strategy Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      value={formData.config[field.key] || field.default}
                      onChange={(e) => {
                        const value =
                          field.type === "number"
                            ? parseFloat(e.target.value)
                            : e.target.value;
                        handleConfigChange(field.key, value);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/strategies"
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Strategy"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
