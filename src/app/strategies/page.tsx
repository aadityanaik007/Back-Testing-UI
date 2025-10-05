"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { strategyAPI, ApiError, Strategy } from "../../services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

interface Filter {
  indicatorA: string;
  valueA: string;
  sign: string;
  indicatorB: string;
  valueB: string;
}

interface Config {
  timeFrame: string;
  filters: Filter[];
}

export default function StrategiesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [newStrategyInfo, setNewStrategyInfo] = useState({
    name: "",
    description: "",
  });
  const [creatingStrategy, setCreatingStrategy] = useState(false);

  // Load strategies on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadStrategies();
    }
  }, [isAuthenticated]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const data = await strategyAPI.getStrategies();
      setStrategies(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load strategies");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await strategyAPI.getTemplates();
      setTemplates(data.templates);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const handleCreateFromTemplate = async (
    templateName: string,
    strategyName: string
  ) => {
    try {
      await strategyAPI.createFromTemplate(templateName, strategyName);
      setShowTemplateModal(false);
      loadStrategies();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create strategy from template");
      }
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (confirm("Are you sure you want to delete this strategy?")) {
      try {
        await strategyAPI.deleteStrategy(id);
        loadStrategies();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete strategy");
        }
      }
    }
  };

  const handleCreateNewStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStrategyInfo.name.trim()) {
      try {
        setError(null);
        setCreatingStrategy(true);

        // Create strategy directly with the API
        const strategy = {
          name: newStrategyInfo.name.trim(),
          description: newStrategyInfo.description.trim(),
          config: {
            timeFrame: 15, // Default timeframe
            filters: [], // Empty filters array
          },
        };

        await strategyAPI.createStrategy(strategy);

        // Close modal and reset form
        setShowCreateModal(false);
        setNewStrategyInfo({ name: "", description: "" });

        // Reload strategies to show the new one
        loadStrategies();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to create strategy");
        }
      } finally {
        setCreatingStrategy(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header activeTab="strategies" />
        <div className="flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to view and manage your strategies.
            </p>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Login
            </Link>
          </div>
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
          <p className="text-gray-600 ml-4">Loading strategies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab="strategies" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Your Strategies
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  await loadTemplates();
                  setShowTemplateModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Create from Template
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Create New Strategy
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No strategies yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first trading strategy.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
                >
                  Create Your First Strategy
                </button>
              </div>
            ) : (
              strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
                >
                  {/* Strategy Name and Description Section */}
                  <div
                    className="cursor-pointer mb-4 hover:bg-blue-50 p-3 rounded-lg transition duration-200 border-2 border-transparent hover:border-blue-200"
                    onClick={() => router.push("/strategies/create")}
                    title="Click to create a new strategy with similar configuration"
                  >
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {strategy.name}
                        </h3>
                        <span className="text-xs text-gray-400 hover:text-blue-500">
                          📝 Click to Duplicate
                        </span>
                      </div>
                      {strategy.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {strategy.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/strategies/${strategy.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                      {/* Show Result button only if backtest is completed */}
                      {strategy.backtest_completed && (
                        <Link
                          href={`/strategyresult/${strategy.id}`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Result
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500">Time Frame:</span>
                          <div className="font-medium">
                            {strategy.config?.timeFrame || "N/A"} min
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Filters:</span>
                          <div className="font-medium">
                            {strategy.config?.filters?.length || 0}
                          </div>
                        </div>
                      </div>

                      {/* Display individual filters if they exist */}
                      {strategy.config?.filters &&
                        strategy.config.filters.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-500 text-xs">
                              Filter Details:
                            </span>
                            <div className="mt-1 space-y-1">
                              {strategy.config.filters.map(
                                (filter: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-200"
                                  >
                                    <span className="font-medium">
                                      {filter.indicatorA}
                                    </span>
                                    <span className="mx-1">
                                      ({filter.valueA})
                                    </span>
                                    <span className="mx-1 text-gray-600">
                                      {filter.sign}
                                    </span>
                                    <span className="font-medium">
                                      {filter.indicatorB}
                                    </span>
                                    <span className="mx-1">
                                      ({filter.valueB})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Show other config properties if they exist */}
                      {(strategy.config?.index ||
                        strategy.config?.expiry ||
                        strategy.config?.legs?.length > 0) && (
                        <div className="mt-3 space-y-3">
                          {/* Basic strategy info */}
                          {(strategy.config?.index ||
                            strategy.config?.expiry) && (
                            <div className="grid grid-cols-2 gap-4">
                              {strategy.config?.index && (
                                <div>
                                  <span className="text-gray-500">Index:</span>
                                  <div className="font-medium text-xs">
                                    {strategy.config.index}
                                  </div>
                                </div>
                              )}
                              {strategy.config?.expiry && (
                                <div>
                                  <span className="text-gray-500">Expiry:</span>
                                  <div className="font-medium text-xs">
                                    {strategy.config.expiry}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Strategy duration and targets */}
                          {(strategy.config?.strategyDuration ||
                            strategy.config?.totalTarget ||
                            strategy.config?.totalStopLoss) && (
                            <div className="grid grid-cols-3 gap-2">
                              {strategy.config?.strategyDuration && (
                                <div>
                                  <span className="text-gray-500 text-xs">
                                    Duration:
                                  </span>
                                  <div className="font-medium text-xs">
                                    {strategy.config.strategyDuration}
                                  </div>
                                </div>
                              )}
                              {strategy.config?.totalTarget > 0 && (
                                <div>
                                  <span className="text-gray-500 text-xs">
                                    Target:
                                  </span>
                                  <div className="font-medium text-xs text-green-600">
                                    {strategy.config.totalTarget}
                                  </div>
                                </div>
                              )}
                              {strategy.config?.totalStopLoss > 0 && (
                                <div>
                                  <span className="text-gray-500 text-xs">
                                    SL:
                                  </span>
                                  <div className="font-medium text-xs text-red-600">
                                    {strategy.config.totalStopLoss}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Display legs if they exist */}
                          {strategy.config?.legs &&
                            strategy.config.legs.length > 0 && (
                              <div>
                                <span className="text-gray-500 text-xs">
                                  Legs ({strategy.config.legs.length}):
                                </span>
                                <div className="mt-1 space-y-1">
                                  {strategy.config.legs
                                    .slice(0, 2)
                                    .map((leg: any, index: number) => (
                                      <div
                                        key={index}
                                        className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded border-l-2 border-indigo-300"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-indigo-800">
                                            {leg.legSegmentName ||
                                              `Leg ${index + 1}`}
                                          </span>
                                          <span className="text-indigo-600 text-xs">
                                            {leg.segment} {leg.optionType}
                                          </span>
                                        </div>
                                        <div className="flex justify-between mt-1 text-gray-600">
                                          <span>
                                            {leg.position} {leg.strike}
                                          </span>
                                          <span>Lot: {leg.lotSize}</span>
                                        </div>
                                      </div>
                                    ))}
                                  {strategy.config.legs.length > 2 && (
                                    <div className="text-xs text-gray-500 italic">
                                      +{strategy.config.legs.length - 2} more
                                      legs...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Updated{" "}
                        {new Date(strategy.updated_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/strategies/${strategy.id}`}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100 transition duration-200"
                        >
                          View Details
                        </Link>
                        {strategy.backtest_completed && (
                          <Link
                            href={`/strategyresult/${strategy.id}`}
                            className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-100 transition duration-200"
                          >
                            Result
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create from Template</h2>
            <div className="grid gap-4">
              {templates.map((template) => (
                <div key={template.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {template.description}
                  </p>
                  <button
                    onClick={() => {
                      const name = prompt(
                        "Enter strategy name:",
                        template.name
                      );
                      if (name) {
                        handleCreateFromTemplate(template.name, name);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Strategy</h2>
            <form onSubmit={handleCreateNewStrategy}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy Name *
                  </label>
                  <input
                    type="text"
                    value={newStrategyInfo.name}
                    onChange={(e) =>
                      setNewStrategyInfo({
                        ...newStrategyInfo,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter strategy name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newStrategyInfo.description}
                    onChange={(e) =>
                      setNewStrategyInfo({
                        ...newStrategyInfo,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter strategy description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStrategyInfo({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStrategy}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {creatingStrategy ? "Creating..." : "Create Strategy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
