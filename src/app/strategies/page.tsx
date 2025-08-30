"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { strategyAPI, Strategy, ApiError } from "../../services/api";

export default function StrategiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Form states
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    description: "",
    config: {},
  });

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

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await strategyAPI.createStrategy(newStrategy);
      setShowCreateModal(false);
      setNewStrategy({ name: "", description: "", config: {} });
      loadStrategies();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create strategy");
      }
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

  const handleDeleteStrategy = async (id: number) => {
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

  const handleDuplicateStrategy = async (id: number, currentName: string) => {
    const newName = prompt(
      "Enter name for the duplicated strategy:",
      `Copy of ${currentName}`
    );
    if (newName) {
      try {
        await strategyAPI.duplicateStrategy(id, newName);
        loadStrategies();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to duplicate strategy");
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
            Please log in to manage your strategies.
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
                <Link
                  href="/strategies"
                  className="text-blue-600 font-medium border-b-2 border-blue-600"
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
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Strategies
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your trading strategies and configurations
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowTemplateModal(true);
                  loadTemplates();
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading strategies...</p>
            </div>
          ) : (
            <>
              {/* Strategies Grid */}
              {strategies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No strategies yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first trading strategy to get started
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Create Strategy
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {strategy.name}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleDuplicateStrategy(
                                strategy.id,
                                strategy.name
                              )
                            }
                            className="text-gray-500 hover:text-blue-600"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(strategy.id)}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {strategy.description && (
                        <p className="text-gray-600 mb-4 text-sm">
                          {strategy.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="text-sm">
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(strategy.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Updated:</span>{" "}
                          {new Date(strategy.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/strategies/${strategy.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition duration-200"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/backtest?strategy=${strategy.id}`}
                          className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded hover:bg-green-700 transition duration-200"
                        >
                          Run Test
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Strategy</h2>
            <form onSubmit={handleCreateStrategy}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newStrategy.name}
                    onChange={(e) =>
                      setNewStrategy({ ...newStrategy, name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newStrategy.description}
                    onChange={(e) =>
                      setNewStrategy({
                        ...newStrategy,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
