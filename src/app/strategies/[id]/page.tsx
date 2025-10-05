"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, Strategy, ApiError } from "../../../services/api";
import Header from "../../../components/Header";

// Types for the comprehensive strategy form
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
  // Legacy fields
  timeFrame?: number;
  filters?: any[];
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

export default function StrategyDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningBacktest, setRunningBacktest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<StrategyConfig>({
    timeFrame: 15,
    filters: [],
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

  const loadStrategy = useCallback(async () => {
    try {
      setLoading(true);
      const data = await strategyAPI.getStrategy(strategyId);
      setStrategy(data);

      // Populate form fields
      setName(data.name);
      setDescription(data.description || "");

      // Populate config with comprehensive structure
      if (data.config) {
        setConfig({
          // Legacy fields
          timeFrame: data.config.timeFrame || 15,
          filters: data.config.filters || [],
          // New comprehensive fields
          index: data.config.index || "",
          expiry: data.config.expiry || "",
          strategyDuration: data.config.strategyDuration || "",
          entryTime: data.config.entryTime || "",
          exitTime: data.config.exitTime || "",
          noReentryAfter: data.config.noReentryAfter || "",
          noExitAfter: data.config.noExitAfter || "",
          overlapEntryAllowed: data.config.overlapEntryAllowed || false,
          legwiseExit: data.config.legwiseExit || false,
          legwiseSquareoff: data.config.legwiseSquareoff || "",
          totalStopLoss: data.config.totalStopLoss || 0,
          totalTarget: data.config.totalTarget || 0,
          timeExit: data.config.timeExit || 0,
          trailingSL: data.config.trailingSL || 0,
          technicalSignal: data.config.technicalSignal || "",
          legs:
            data.config.legs && data.config.legs.length > 0
              ? data.config.legs
              : [
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
      }

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
  }, [strategyId]);

  useEffect(() => {
    if (isAuthenticated && strategyId) {
      loadStrategy();
    }
  }, [isAuthenticated, strategyId, loadStrategy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    setWarningMessage(null);

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

      // Clean up config based on technical signal
      const cleanConfig = { ...config };

      // If technical signal is not applicable, ensure leg data is minimal
      if (config.technicalSignal !== "Applicable") {
        // Ensure legs are cleared if technical signal is not applicable
        cleanConfig.legs = [
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
        ];
      }

      const strategyData = {
        name: name.trim(),
        description: description.trim(),
        config: cleanConfig,
      };

      console.log(
        "Sending strategy data:",
        JSON.stringify(strategyData, null, 2)
      );

      await strategyAPI.updateStrategy(strategyId, strategyData);
      setSuccessMessage("Strategy updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update strategy");
      }
      console.error("Strategy update error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to save config changes immediately
  const handleConfigUpdate = async (updatedConfig: StrategyConfig) => {
    try {
      const strategyData = {
        name: name.trim(),
        description: description.trim(),
        config: updatedConfig,
      };

      console.log(
        "Auto-saving strategy after leg deletion:",
        JSON.stringify(strategyData, null, 2)
      );

      await strategyAPI.updateStrategy(strategyId, strategyData);
      console.log("Auto-save successful");
    } catch (err) {
      console.error("Auto-save failed:", err);
      if (err instanceof ApiError) {
        setError(`Failed to save changes: ${err.message}`);
      } else {
        setError("Failed to save changes to database");
      }
    }
  };

  const updateConfig = (
    field: keyof StrategyConfig,
    value: string | number | boolean
  ) => {
    // Handle technical signal change
    if (field === "technicalSignal") {
      const hasConfiguredLegs = config.legs.some(
        (leg) =>
          leg.legSegmentName ||
          leg.expiry ||
          leg.segment ||
          leg.optionType ||
          leg.position ||
          leg.strike ||
          leg.lotSize > 0 ||
          leg.targetProfit > 0 ||
          leg.stopLoss > 0
      );

      if (value === "Not Applicable" && hasConfiguredLegs) {
        // Ask for confirmation before deleting leg data
        const confirmDelete = confirm(
          "Changing technical signal to 'Not Applicable' will permanently delete all leg segment configurations from the database. " +
            "This action cannot be undone. Do you want to continue?"
        );

        if (confirmDelete) {
          // Clear leg data completely
          const updatedConfig = {
            ...config,
            [field]: value,
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
          };

          setConfig(updatedConfig);

          // Show confirmation message
          setSuccessMessage(
            "Technical signal changed to 'Not Applicable' and leg segments have been cleared."
          );
          setTimeout(() => setSuccessMessage(null), 5000);

          // Automatically save the changes to database to ensure deletion
          handleConfigUpdate(updatedConfig);

          return; // Exit early since we've already updated the config
        } else {
          // User cancelled, don't change the technical signal
          return;
        }
      } else if (value === "Not Applicable") {
        setWarningMessage(null);
      } else {
        setWarningMessage(null);
      }
    }

    setConfig({ ...config, [field]: value });
  };

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

  const handleDelete = async () => {
    console.log("Delete button clicked for strategy:", strategyId);

    if (
      confirm(
        "Are you sure you want to delete this strategy? This action cannot be undone."
      )
    ) {
      try {
        console.log("User confirmed deletion, calling API...");
        await strategyAPI.deleteStrategy(strategyId);
        console.log("Delete successful, redirecting...");
        router.push("/strategies");
      } catch (err) {
        console.error("Delete failed with error:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete strategy");
        }
      }
    } else {
      console.log("User cancelled deletion");
    }
  };

  const handleRunBacktest = async () => {
    console.log("Run Backtest clicked for strategy:", strategyId);

    try {
      setRunningBacktest(true);
      await strategyAPI.runBacktest(strategyId);
      console.log("Backtest completed successfully");

      // Optional: Show success message or update state
      alert("Backtest completed successfully!");

      // Refresh the strategy data to get the updated backtest status
      const updatedStrategy = await strategyAPI.getStrategy(strategyId);
      setStrategy(updatedStrategy);
    } catch (err) {
      console.error("Backtest failed with error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to run backtest");
      }
    } finally {
      setRunningBacktest(false);
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
              The strategy you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
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
              <button
                onClick={handleRunBacktest}
                disabled={runningBacktest}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  runningBacktest
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {runningBacktest ? "Running..." : "Run Backtest"}
              </button>
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

          {warningMessage && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              {warningMessage}
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

                {/* Leg Segments - Only show when technical signal is Applicable */}
                {config.technicalSignal === "Applicable" && (
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
                                updateLeg(
                                  index,
                                  "legSegmentName",
                                  e.target.value
                                )
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
                )}

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
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition duration-200"
                  >
                    {saving ? "Saving..." : "Update Strategy"}
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
