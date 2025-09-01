"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, Strategy, ApiError } from "../../../services/api";
import Header from "../../../components/Header";

export default function StrategyDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;

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

  // Indicator and sign options
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

  // Remove old configFields and replace with new config state
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

  // Sync config with loaded strategy
  useEffect(() => {
    if (strategy && strategy.config) {
      setConfig({
        timeFrame: strategy.config.timeFrame || "",
        filters:
          strategy.config.filters && Array.isArray(strategy.config.filters)
            ? strategy.config.filters
            : [
                {
                  indicatorA: "1",
                  valueA: "",
                  sign: "<",
                  indicatorB: "1",
                  valueB: "",
                },
              ],
      });
    }
  }, [strategy]);

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
      await strategyAPI.updateStrategy(strategyId, {
        ...formData,
        config,
      });
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
        <Header activeTab="strategies" />
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
        <Header activeTab="strategies" />
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
      <Header activeTab="strategies" />

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

            {/* New Strategy Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Strategy Configuration
              </h2>
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
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg mb-4 border"
                    >
                      {/* Filter inputs in a responsive grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Indicator A
                          </label>
                          <select
                            value={filter.indicatorA}
                            onChange={(e) => {
                              const filters = [...config.filters];
                              filters[idx].indicatorA = e.target.value;
                              setConfig({ ...config, filters });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {indicatorOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Value A
                          </label>
                          <input
                            type="number"
                            value={filter.valueA}
                            onChange={(e) => {
                              const filters = [...config.filters];
                              filters[idx].valueA = e.target.value;
                              setConfig({ ...config, filters });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Value"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Condition
                          </label>
                          <select
                            value={filter.sign}
                            onChange={(e) => {
                              const filters = [...config.filters];
                              filters[idx].sign = e.target.value;
                              setConfig({ ...config, filters });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {signOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Indicator B
                          </label>
                          <select
                            value={filter.indicatorB}
                            onChange={(e) => {
                              const filters = [...config.filters];
                              filters[idx].indicatorB = e.target.value;
                              setConfig({ ...config, filters });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {indicatorOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Value B
                          </label>
                          <input
                            type="number"
                            value={filter.valueB}
                            onChange={(e) => {
                              const filters = [...config.filters];
                              filters[idx].valueB = e.target.value;
                              setConfig({ ...config, filters });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Value"
                          />
                        </div>
                      </div>

                      {/* Action buttons on a separate line */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {config.filters.length > 1 && (
                            <span>
                              Filter {idx + 1} of {config.filters.length}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const filters = [...config.filters];
                              filters.splice(idx, 1);
                              setConfig({ ...config, filters });
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={config.filters.length === 1}
                            title="Remove filter"
                          >
                            −
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
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                            title="Add filter after this one"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
