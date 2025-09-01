"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import ChartDashboard from "../../components/ChartDashboard";
import { TradingViewIframe } from "../../components/TradingViewChart";
import Header from "../../components/Header";

const ChartsPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [layout, setLayout] = useState<"single" | "dual" | "quad">("single");

  const renderCharts = () => {
    switch (layout) {
      case "single":
        return (
          <div className="w-full">
            <ChartDashboard />
          </div>
        );

      case "dual":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h4 className="text-md font-semibold mb-4 text-gray-800">
                NIFTY 50
              </h4>
              <TradingViewIframe symbol="NSE:NIFTY" height={300} />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h4 className="text-md font-semibold mb-4 text-gray-800">
                BANK NIFTY
              </h4>
              <TradingViewIframe symbol="NSE:BANKNIFTY" height={300} />
            </div>
          </div>
        );

      case "quad":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-800">
                NIFTY 50
              </h4>
              <TradingViewIframe symbol="NSE:NIFTY" height={250} />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-800">
                BANK NIFTY
              </h4>
              <TradingViewIframe symbol="NSE:BANKNIFTY" height={250} />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-800">
                RELIANCE
              </h4>
              <TradingViewIframe symbol="NSE:RELIANCE" height={250} />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-800">
                HDFC BANK
              </h4>
              <TradingViewIframe symbol="NSE:HDFCBANK" height={250} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <Header activeTab="charts" />

      {/* Charts Page Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Live Market Charts
            </h1>

            {/* Layout Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Layout:</span>
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setLayout("single")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    layout === "single"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setLayout("dual")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    layout === "dual"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dual
                </button>
                <button
                  onClick={() => setLayout("quad")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    layout === "quad"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Quad
                </button>
              </div>
            </div>
          </div>

          {/* Charts Container */}
          <div className="space-y-6">{renderCharts()}</div>

          {/* Additional Information */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Chart Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">Real-time Data</h3>
                  <p className="text-sm text-gray-600">
                    Live market data from TradingView
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Multiple Layouts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Single, dual, and quad chart layouts
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Interactive Charts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Zoom, pan, and analyze with indicators
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">Indian Markets</h3>
                  <p className="text-sm text-gray-600">
                    NSE, BSE indices and individual stocks
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Light/Dark Themes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Switch between light and dark modes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Technical Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Full suite of technical indicators
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;
