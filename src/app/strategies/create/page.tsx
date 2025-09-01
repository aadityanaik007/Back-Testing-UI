"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, ApiError } from "../../../services/api";
import Header from "../../../components/Header";

export default function CreateStrategyPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [filters, setFilters] = useState([
    {
      indicatorA: "",
      valueA: "",
      sign: "",
      indicatorB: "",
      valueB: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form fields from URL parameters (from modal)
  useEffect(() => {
    const nameParam = searchParams.get("name");
    const descriptionParam = searchParams.get("description");

    if (nameParam) {
      setName(decodeURIComponent(nameParam));
    }
    if (descriptionParam) {
      setDescription(decodeURIComponent(descriptionParam));
    }
  }, [searchParams]);

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
    "Equal to",
    "Not Equal to",
  ];

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        indicatorA: "",
        valueA: "",
        sign: "",
        indicatorB: "",
        valueB: "",
      },
    ]);
  };

  // Check if all fields in current filters are filled
  const areAllFiltersFilled = () => {
    return filters.every(
      (filter) =>
        filter.indicatorA.trim() !== "" &&
        filter.valueA.trim() !== "" &&
        filter.sign.trim() !== "" &&
        filter.indicatorB.trim() !== "" &&
        filter.valueB.trim() !== ""
    );
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: string, value: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        setError("Strategy name is required");
        return;
      }

      if (!timeFrame.trim()) {
        setError("Time frame is required");
        return;
      }

      // Create strategy configuration
      const config = {
        timeFrame: parseInt(timeFrame),
        filters: filters.map((filter) => ({
          indicatorA: filter.indicatorA,
          valueA: filter.valueA,
          sign: filter.sign,
          indicatorB: filter.indicatorB,
          valueB: filter.valueB,
        })),
      };

      const strategy = {
        name: name.trim(),
        description: description.trim(),
        config,
      };

      await strategyAPI.createStrategy(strategy);
      router.push("/strategies");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create strategy. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header activeTab="strategies" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to create strategies.
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab="strategies" />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link
                href="/strategies"
                className="text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
              >
                ← Back to Strategies
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Strategy
              </h1>
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

          {/* Create Strategy Form */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strategy Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter strategy name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter strategy description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Frame (in minutes) *
                  </label>
                  <input
                    type="number"
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter time frame in minutes"
                    min="1"
                    required
                  />
                </div>

                {/* Filters */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Filter Conditions
                    </label>
                    <div className="flex flex-col items-end">
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={addFilter}
                          disabled={!areAllFiltersFilled()}
                          className={`font-medium text-sm px-3 py-1 rounded transition duration-200 ${
                            areAllFiltersFilled()
                              ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          + Add Filter
                        </button>
                        {!areAllFiltersFilled() && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            Complete the entire form row before adding another
                            condition
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                      {!areAllFiltersFilled() && (
                        <span className="text-xs text-gray-500 mt-1">
                          Complete all current filters first
                        </span>
                      )}
                    </div>
                  </div>

                  {filters.map((filter, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Filter {index + 1}
                        </h4>
                        {filters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFilter(index)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Indicator A
                          </label>
                          <select
                            value={filter.indicatorA}
                            onChange={(e) =>
                              updateFilter(index, "indicatorA", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Indicator</option>
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
                            type="text"
                            value={filter.valueA}
                            onChange={(e) =>
                              updateFilter(index, "valueA", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Value"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Sign
                          </label>
                          <select
                            value={filter.sign}
                            onChange={(e) =>
                              updateFilter(index, "sign", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Sign</option>
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
                            onChange={(e) =>
                              updateFilter(index, "indicatorB", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Indicator</option>
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
                            type="text"
                            value={filter.valueB}
                            onChange={(e) =>
                              updateFilter(index, "valueB", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Value"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link
                    href="/strategies"
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition duration-200"
                  >
                    {isSubmitting ? "Creating..." : "Create Strategy"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
