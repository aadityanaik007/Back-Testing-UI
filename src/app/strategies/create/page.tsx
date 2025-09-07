"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, ApiError } from "../../../services/api";
import Header from "../../../components/Header";

// Types for the strategy form
interface LegConfig {
  legSegmentName: string;
  expiry: string;
  segment: string;
  optionType: string;
  position: string;
  strike: string;
  strikeSelectionParameter: string;
  lotSize: number;
  targetProfit: number;
  stopLoss: number;
}

interface StrategyConfig {
  // General Strategy Settings
  index: string;
  expiry: string;
  strategyDuration: string;
  entryTime: string;
  exitTime: string;
  noReentryAfter: string;
  noExitAfter: string;
  overlapEntryAllowed: boolean;
  legwiseExit: boolean;
  legwiseSquareoff: string;
  totalStopLoss: number;
  totalTarget: number;
  timeExit: number;
  trailingSL: number;
  technicalSignal: string;

  // Legs
  legs: LegConfig[];
}

export default function CreateStrategyPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<StrategyConfig>({
    index: "",
    expiry: "",
    strategyDuration: "",
    entryTime: "",
    exitTime: "",
    noReentryAfter: "",
    noExitAfter: "",
    overlapEntryAllowed: false,
    legwiseExit: false,
    legwiseSquareoff: "",
    totalStopLoss: 0,
    totalTarget: 0,
    timeExit: 0,
    trailingSL: 0,
    technicalSignal: "",
    legs: [
      {
        legSegmentName: "",
        expiry: "",
        segment: "",
        optionType: "",
        position: "",
        strike: "",
        strikeSelectionParameter: "",
        lotSize: 0,
        targetProfit: 0,
        stopLoss: 0,
      },
    ],
  });
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

  // Enum options
  const indexOptions = ["Nifty", "Banknifty", "Sensex", "Bankex"];
  const expiryOptions = [
    "Current Week",
    "Next Week",
    "Current Month",
    "Next Month",
  ];
  const strategyDurationOptions = ["Intraday", "BTST", "Positional"];
  const segmentOptions = ["Futures", "Option"];
  const optionTypeOptions = ["Call", "Put"];
  const positionOptions = ["Buy", "Sell"];
  const strikeOptions = [
    "ATM",
    "ITM1",
    "ITM2",
    "OTM1",
    "OTM2",
    "Not Applicable",
  ];
  const strikeSelectionOptions = [
    "Delta <=",
    "Delta >=",
    "Premium >=",
    "Premium <=",
    "Not Applicable",
  ];
  const legwiseSquareoffOptions = ["Partial", "Full"];
  const technicalSignalOptions = ["Applicable", "Not Applicable"];

  const addLeg = () => {
    setConfig({
      ...config,
      legs: [
        ...config.legs,
        {
          legSegmentName: "",
          expiry: "",
          segment: "",
          optionType: "",
          position: "",
          strike: "",
          strikeSelectionParameter: "",
          lotSize: 0,
          targetProfit: 0,
          stopLoss: 0,
        },
      ],
    });
  };

  const removeLeg = (index: number) => {
    if (config.legs.length > 1) {
      setConfig({
        ...config,
        legs: config.legs.filter((_, i) => i !== index),
      });
    }
  };

  const updateLeg = (
    index: number,
    field: keyof LegConfig,
    value: string | number
  ) => {
    const updatedLegs = [...config.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setConfig({ ...config, legs: updatedLegs });
  };

  const updateConfig = (
    field: keyof StrategyConfig,
    value: string | number | boolean
  ) => {
    setConfig({ ...config, [field]: value });
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

      if (!config.index) {
        setError("Index selection is required");
        return;
      }

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
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                {/* General Strategy Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    General Strategy Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Index *
                      </label>
                      <select
                        value={config.index}
                        onChange={(e) => updateConfig("index", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Index</option>
                        {indexOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry
                      </label>
                      <select
                        value={config.expiry}
                        onChange={(e) => updateConfig("expiry", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Expiry</option>
                        {expiryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strategy Duration
                      </label>
                      <select
                        value={config.strategyDuration}
                        onChange={(e) =>
                          updateConfig("strategyDuration", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Duration</option>
                        {strategyDurationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entry Time
                      </label>
                      <input
                        type="time"
                        value={config.entryTime}
                        onChange={(e) =>
                          updateConfig("entryTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exit Time
                      </label>
                      <input
                        type="time"
                        value={config.exitTime}
                        onChange={(e) =>
                          updateConfig("exitTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No Re-entry After
                      </label>
                      <input
                        type="time"
                        value={config.noReentryAfter}
                        onChange={(e) =>
                          updateConfig("noReentryAfter", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No Exit After
                      </label>
                      <input
                        type="time"
                        value={config.noExitAfter}
                        onChange={(e) =>
                          updateConfig("noExitAfter", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.overlapEntryAllowed}
                        onChange={(e) =>
                          updateConfig("overlapEntryAllowed", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Overlap Entry Allowed
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.legwiseExit}
                        onChange={(e) =>
                          updateConfig("legwiseExit", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Legwise Exit
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legwise Squareoff
                      </label>
                      <select
                        value={config.legwiseSquareoff}
                        onChange={(e) =>
                          updateConfig("legwiseSquareoff", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Option</option>
                        {legwiseSquareoffOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Stop Loss
                      </label>
                      <input
                        type="number"
                        value={config.totalStopLoss}
                        onChange={(e) =>
                          updateConfig(
                            "totalStopLoss",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Target
                      </label>
                      <input
                        type="number"
                        value={config.totalTarget}
                        onChange={(e) =>
                          updateConfig(
                            "totalTarget",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Exit (in minutes)
                      </label>
                      <input
                        type="number"
                        value={config.timeExit}
                        onChange={(e) =>
                          updateConfig(
                            "timeExit",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trailing SL
                      </label>
                      <input
                        type="number"
                        value={config.trailingSL}
                        onChange={(e) =>
                          updateConfig(
                            "trailingSL",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technical Signal
                      </label>
                      <select
                        value={config.technicalSignal}
                        onChange={(e) =>
                          updateConfig("technicalSignal", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Option</option>
                        {technicalSignalOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Leg Segments */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Leg Segments
                    </h3>
                    <button
                      type="button"
                      onClick={addLeg}
                      disabled={config.legs.length >= 4}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition duration-200 ${
                        config.legs.length >= 4
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Add Leg (Max 4)
                    </button>
                  </div>

                  {config.legs.map((leg, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 mb-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-gray-800">
                          Leg {index + 1}
                        </h4>
                        {config.legs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLeg(index)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remove Leg
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Leg Segment Name
                          </label>
                          <input
                            type="text"
                            value={leg.legSegmentName}
                            onChange={(e) =>
                              updateLeg(index, "legSegmentName", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter leg name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry
                          </label>
                          <input
                            type="date"
                            value={leg.expiry}
                            onChange={(e) =>
                              updateLeg(index, "expiry", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Segment
                          </label>
                          <select
                            value={leg.segment}
                            onChange={(e) =>
                              updateLeg(index, "segment", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Segment</option>
                            {segmentOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Option Type
                          </label>
                          <select
                            value={leg.optionType}
                            onChange={(e) =>
                              updateLeg(index, "optionType", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Type</option>
                            {optionTypeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <select
                            value={leg.position}
                            onChange={(e) =>
                              updateLeg(index, "position", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Position</option>
                            {positionOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Strike
                          </label>
                          <select
                            value={leg.strike}
                            onChange={(e) =>
                              updateLeg(index, "strike", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Strike</option>
                            {strikeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Strike Selection Parameter
                          </label>
                          <select
                            value={leg.strikeSelectionParameter}
                            onChange={(e) =>
                              updateLeg(
                                index,
                                "strikeSelectionParameter",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Parameter</option>
                            {strikeSelectionOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lot Size
                          </label>
                          <input
                            type="number"
                            value={leg.lotSize}
                            onChange={(e) =>
                              updateLeg(
                                index,
                                "lotSize",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Profit
                          </label>
                          <input
                            type="number"
                            value={leg.targetProfit}
                            onChange={(e) =>
                              updateLeg(
                                index,
                                "targetProfit",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stop Loss
                          </label>
                          <input
                            type="number"
                            value={leg.stopLoss}
                            onChange={(e) =>
                              updateLeg(
                                index,
                                "stopLoss",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
