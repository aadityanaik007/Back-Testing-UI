"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { strategyAPI, Strategy, ApiError } from "../../../services/api";
import Header from "../../../components/Header";
import Pagination from "../../../components/Pagination";
import { TradeResult } from "@/types/tradeResult";
import { bullCreditApi, BullCreditData } from "@/api/bullCreditApi";

// Column definition interface
interface ColumnConfig {
  key: keyof TradeResult;
  label: string;
  isMinimal: boolean;
  format?: (value: any) => string;
}

// Define all columns with their configurations
const ALL_COLUMNS: ColumnConfig[] = [
  {
    key: "signal_time",
    label: "Signal Time",
    isMinimal: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "entry_time",
    label: "Entry Time",
    isMinimal: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "entry_price",
    label: "Entry Price",
    isMinimal: true,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "exit_datetime",
    label: "Exit Date",
    isMinimal: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "pnl",
    label: "P&L",
    isMinimal: true,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "entry_spread",
    label: "Entry Spread",
    isMinimal: false,
    format: (val) => val.toFixed(2),
  },
  // Removed invalid "exit_time" column as it is not a key of TradeResult
  {
    key: "exit_spread",
    label: "Exit Spread",
    isMinimal: false,
    format: (val) => val.toFixed(2),
  },
  {
    key: "exit_price",
    label: "Exit Price",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  { key: "exit_reason", label: "Exit Reason", isMinimal: false },
  {
    key: "sl_price",
    label: "SL Price",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  { key: "expiry", label: "Expiry", isMinimal: false },
  { key: "opttype", label: "Option Type", isMinimal: false },
  {
    key: "buy_leg_strike",
    label: "Buy Strike",
    isMinimal: false,
    format: (val) => val.toFixed(2),
  },
  {
    key: "sell_leg_strike",
    label: "Sell Strike",
    isMinimal: false,
    format: (val) => val.toFixed(2),
  },
  {
    key: "buy_leg_entry_price",
    label: "Buy Entry",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "sell_leg_entry_price",
    label: "Sell Entry",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "buy_leg_exit_price",
    label: "Buy Exit",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "sell_leg_exit_price",
    label: "Sell Exit",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "net_option_pnl",
    label: "Net Option P&L",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "max_profit_time",
    label: "Max Profit Time",
    isMinimal: false,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "max_profit_pnl",
    label: "Max Profit",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
  {
    key: "min_profit_time",
    label: "Min Profit Time",
    isMinimal: false,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "min_profit_pnl",
    label: "Min Profit",
    isMinimal: false,
    format: (val) => `₹${val.toFixed(2)}`,
  },
];

export default function StrategyResultPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;

  // State variables
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof TradeResult>>(
    new Set(ALL_COLUMNS.filter((col) => col.isMinimal).map((col) => col.key))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TradeResult;
    direction: "asc" | "desc";
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset to first page when sorting changes or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig, itemsPerPage]);

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: keyof TradeResult) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnKey)) {
      newVisibleColumns.delete(columnKey);
    } else {
      newVisibleColumns.add(columnKey);
    }
    setVisibleColumns(newVisibleColumns);
  };

  // Show/hide all columns
  const toggleAllColumns = (show: boolean) => {
    if (show) {
      setVisibleColumns(new Set(ALL_COLUMNS.map((col) => col.key)));
    } else {
      setVisibleColumns(new Set());
    }
  };

  // Reset to minimal view
  const resetToMinimal = () => {
    setVisibleColumns(
      new Set(ALL_COLUMNS.filter((col) => col.isMinimal).map((col) => col.key))
    );
  };

  // Get bull credit trade data
  const getBullCreditData = async (): Promise<TradeResult[]> => {
    const response = await bullCreditApi.getData();
    return response.data.map((item: any) => ({
      signal_time: item.signal_time,
      entry_time: item.entry_time,
      entry_datetime: new Date(item.entry_datetime),
      entry_price: item.entry_price,
      entry_spread: item.entry_spread,
      entry_month: item.entry_month,
      vix_at_entry: item.vix_at_entry,
      vix_at_entry_time: item.vix_at_entry_time,
      indicator: item.indicator,
      exit_datetime: new Date(item.exit_datetime),
      exit_spread: item.exit_spread,
      exit_price: item.exit_price,
      exit_reason: item.exit_reason,
      sl_price: item.sl_price,
      price_difference: item.price_difference,
      pnl: item.pnl,
      expiry: item.expiry,
      opttype: item.opttype,
      buy_leg_strike: item.buy_leg_strike,
      sell_leg_strike: item.sell_leg_strike,
      buy_leg_entry_price: item.buy_leg_entry_price,
      sell_leg_entry_price: item.sell_leg_entry_price,
      buy_leg_exit_price: item.buy_leg_exit_price,
      sell_leg_exit_price: item.sell_leg_exit_price,
      max_profit_time: new Date(item.max_profit_time),
      max_profit_pnl: item.max_profit_pnl,
      min_profit_time: new Date(item.min_profit_time),
      min_profit_pnl: item.min_profit_pnl,
      net_option_pnl: item.net_option_pnl || 0
    }));
  };

  const loadStrategy = useCallback(async () => {
    try {
      setLoading(true);
      const tradeData = await getBullCreditData();
      setStrategy({
        id: strategyId,
        name: "Bull Credit Spread Strategy",
        description: "Intraday Bull Credit Spread strategy",
        config: {
          type: "BULL_CREDIT_SPREAD",
          timeframe: "INTRADAY"
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        backtest_completed: true
      });
      setTradeResults(tradeData);
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
  }, [strategyId, user?.id]);

  const handleSort = (key: keyof TradeResult) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTradeResults = sortConfig
    ? [...tradeResults].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      })
    : tradeResults;

  const displayColumns = ALL_COLUMNS.filter((col) =>
    visibleColumns.has(col.key)
  );

  const paginatedTradeResults = sortedTradeResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedTradeResults.length / itemsPerPage);

  // Calculate detailed statistics
  const calculateDetailedStats = () => {
    if (tradeResults.length === 0) {
      return {
        overallProfit: 0,
        noOfTrades: 0,
        avgProfitPerTrade: 0,
        winPercentage: 0,
        lossPercentage: 0,
        avgProfitOnWinning: 0,
        avgLossOnLosing: 0,
        maxProfitSingle: 0,
        maxLossSingle: 0,
        maxDrawdown: 0,
        durationMaxDrawdown: 0,
        returnMaxDD: 0,
        rewardToRisk: 0,
        expectancyRatio: 0,
        maxWinStreak: 0,
        maxLosingStreak: 0,
        maxTradesInDrawdown: 0,
      };
    }

    const winningTrades = tradeResults.filter((t) => t.pnl > 0);
    const losingTrades = tradeResults.filter((t) => t.pnl < 0);
    const overallProfit = tradeResults.reduce((sum, t) => sum + t.pnl, 0);

    // Calculate streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLosingStreak = 0;

    tradeResults.forEach((trade) => {
      if (trade.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (trade.pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLosingStreak = Math.max(maxLosingStreak, currentLossStreak);
      }
    });

    // Calculate running P&L for drawdown calculation
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let drawdownStart = -1;
    let maxDrawdownDuration = 0;
    let currentDrawdownTrades = 0;
    let maxTradesInDrawdown = 0;
    let inDrawdown = false;

    tradeResults.forEach((trade, index) => {
      runningPnL += trade.pnl;

      if (runningPnL > peak) {
        peak = runningPnL;
        if (inDrawdown) {
          inDrawdown = false;
          maxTradesInDrawdown = Math.max(
            maxTradesInDrawdown,
            currentDrawdownTrades
          );
          currentDrawdownTrades = 0;
        }
      } else {
        const currentDrawdown = peak - runningPnL;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
          if (drawdownStart >= 0) {
            maxDrawdownDuration = index - drawdownStart + 1;
          }
        }

        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStart = index;
          currentDrawdownTrades = 1;
        } else {
          currentDrawdownTrades++;
        }
      }
    });

    // Final check for drawdown at the end
    if (inDrawdown) {
      maxTradesInDrawdown = Math.max(
        maxTradesInDrawdown,
        currentDrawdownTrades
      );
    }

    const avgProfitOnWinning =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) /
          winningTrades.length
        : 0;

    const avgLossOnLosing =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + t.pnl, 0) /
              losingTrades.length
          )
        : 0;

    return {
      overallProfit,
      noOfTrades: tradeResults.length,
      avgProfitPerTrade: overallProfit / tradeResults.length,
      winPercentage: (winningTrades.length / tradeResults.length) * 100,
      lossPercentage: (losingTrades.length / tradeResults.length) * 100,
      avgProfitOnWinning,
      avgLossOnLosing,
      maxProfitSingle: Math.max(...tradeResults.map((t) => t.pnl)),
      maxLossSingle: Math.abs(Math.min(...tradeResults.map((t) => t.pnl))),
      maxDrawdown,
      durationMaxDrawdown: maxDrawdownDuration,
      returnMaxDD: maxDrawdown > 0 ? overallProfit / maxDrawdown : 0,
      rewardToRisk:
        avgLossOnLosing > 0 ? avgProfitOnWinning / avgLossOnLosing : 0,
      expectancyRatio:
        tradeResults.length > 0
          ? (winningTrades.length / tradeResults.length) * avgProfitOnWinning -
            (losingTrades.length / tradeResults.length) * avgLossOnLosing
          : 0,
      maxWinStreak,
      maxLosingStreak,
      maxTradesInDrawdown,
    };
  };

  const stats = calculateDetailedStats();

  const formatCellValue = (value: any, column: ColumnConfig) => {
    if (value === null || value === undefined) return "-";
    if (column.format) return column.format(value);
    return String(value);
  };

  useEffect(() => {
    if (isAuthenticated && strategyId) {
      loadStrategy();
    }
  }, [isAuthenticated, strategyId, loadStrategy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please log in to view strategy results.
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
          <p className="text-gray-600 ml-4">Loading strategy results...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/strategies"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
            >
              ← Back to Strategies
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Strategy Results
            </h1>
            <p className="text-gray-600 mt-2">
              Results for: {strategy?.name || "Loading..."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Trades
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {tradeResults.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Winning Trades
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {tradeResults.filter((t) => t.pnl > 0).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total P&L
              </h3>
              <p
                className={`text-2xl font-bold ${
                  tradeResults.reduce((sum, t) => sum + t.pnl, 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹{tradeResults.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Win Rate
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {tradeResults.length > 0
                  ? (
                      (tradeResults.filter((t) => t.pnl > 0).length /
                        tradeResults.length) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Detailed Statistics Section */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Detailed Performance Metrics
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Overall Profit:
                    </span>
                    <span
                      className={`font-semibold ${
                        stats.overallProfit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{stats.overallProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      No. of Trades:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {stats.noOfTrades}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Average Profit per Trade:
                    </span>
                    <span
                      className={`font-semibold ${
                        stats.avgProfitPerTrade >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{stats.avgProfitPerTrade.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Win %:
                    </span>
                    <span className="font-semibold text-green-600">
                      {stats.winPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Loss %:
                    </span>
                    <span className="font-semibold text-red-600">
                      {stats.lossPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Average Profit on Winning Trades:
                    </span>
                    <span className="font-semibold text-green-600">
                      ₹{stats.avgProfitOnWinning.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Average Loss on Losing Trades:
                    </span>
                    <span className="font-semibold text-red-600">
                      ₹{stats.avgLossOnLosing.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max Profit in Single Trade:
                    </span>
                    <span className="font-semibold text-green-600">
                      ₹{stats.maxProfitSingle.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max Loss in Single Trade:
                    </span>
                    <span className="font-semibold text-red-600">
                      ₹{stats.maxLossSingle.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max Drawdown:
                    </span>
                    <span className="font-semibold text-red-600">
                      ₹{stats.maxDrawdown.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Duration of Max Drawdown:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {stats.durationMaxDrawdown} trades
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Return/MaxDD:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {stats.returnMaxDD.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Reward to Risk Ratio:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {stats.rewardToRisk.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Expectancy Ratio:
                    </span>
                    <span
                      className={`font-semibold ${
                        stats.expectancyRatio >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.expectancyRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max Win Streak (trades):
                    </span>
                    <span className="font-semibold text-green-600">
                      {stats.maxWinStreak}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max Losing Streak (trades):
                    </span>
                    <span className="font-semibold text-red-600">
                      {stats.maxLosingStreak}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Max trades in any drawdown:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {stats.maxTradesInDrawdown}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white rounded-lg shadow-md">
            {/* Table Header Controls */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Trade Results
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowColumnFilter(!showColumnFilter)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {showColumnFilter ? "Hide" : "Show"} Column Filter
                  </button>
                  <div className="text-sm text-gray-500">
                    Showing {visibleColumns.size} of {ALL_COLUMNS.length}{" "}
                    columns
                  </div>
                </div>
              </div>

              {/* Column Filter Panel */}
              {showColumnFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Column Visibility
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={resetToMinimal}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Reset to Minimal
                      </button>
                      <button
                        onClick={() => toggleAllColumns(true)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Show All
                      </button>
                      <button
                        onClick={() => toggleAllColumns(false)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Hide All
                      </button>
                    </div>
                  </div>

                  {/* Column Checkboxes Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ALL_COLUMNS.map((column) => (
                      <div key={column.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`column-${column.key}`}
                          checked={visibleColumns.has(column.key)}
                          onChange={() => toggleColumnVisibility(column.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`column-${column.key}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {column.label}
                          {column.isMinimal && (
                            <span className="ml-1 text-xs text-blue-500 font-medium">
                              (Core)
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {displayColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {sortConfig?.key === column.key && (
                            <span className="text-blue-500">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTradeResults
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((trade, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {displayColumns.map((column) => (
                          <td
                            key={`${index}-${column.key}`}
                            className="px-4 py-3 whitespace-nowrap text-sm"
                          >
                            <div
                              className={`
                            ${
                              column.key === "pnl" ||
                              column.key === "net_option_pnl" ||
                              column.key === "max_profit_pnl" ||
                              column.key === "min_profit_pnl"
                                ? (trade[column.key] as number) >= 0
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                                : "text-gray-900"
                            }
                          `}
                            >
                              {formatCellValue(trade[column.key], column)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {tradeResults.length === 0 && !loading && (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No trade results found for this strategy.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {tradeResults.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1); // Reset to first page when changing items per page
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {Math.min(
                            (currentPage - 1) * itemsPerPage + 1,
                            tradeResults.length
                          )}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            tradeResults.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {tradeResults.length}
                        </span>{" "}
                        results
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        Previous
                      </button>
                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              Math.ceil(tradeResults.length / itemsPerPage)
                            ),
                          },
                          (_, i) => {
                            const totalPages = Math.ceil(
                              tradeResults.length / itemsPerPage
                            );
                            let pageNum;

                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else {
                              if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - (4 - i);
                              } else {
                                pageNum = currentPage + (i - 2);
                              }
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-blue-600 hover:bg-blue-50"
                                } border border-gray-300`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(tradeResults.length / itemsPerPage)
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(tradeResults.length / itemsPerPage)
                        }
                        className={`px-3 py-1 rounded ${
                          currentPage ===
                          Math.ceil(tradeResults.length / itemsPerPage)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        Next
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.ceil(tradeResults.length / itemsPerPage)
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(tradeResults.length / itemsPerPage)
                        }
                        className={`px-3 py-1 rounded ${
                          currentPage ===
                          Math.ceil(tradeResults.length / itemsPerPage)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
