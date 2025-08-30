"use client";
import React, { useState } from "react";
import { TradingViewIframe } from "./TradingViewChart";
import SymbolSearch from "./SymbolSearch";

interface ChartDashboardProps {
  className?: string;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ className }) => {
  const [selectedSymbol, setSelectedSymbol] = useState("NSE:NIFTY");
  const [chartTheme, setChartTheme] = useState<"light" | "dark">("light");

  const symbols = [
    // Indices
    { value: "NSE:NIFTY", label: "NIFTY 50" },
    { value: "NSE:BANKNIFTY", label: "BANK NIFTY" },
    { value: "NSE:FINNIFTY", label: "FIN NIFTY" },
    { value: "NSE:MIDCPNIFTY", label: "MIDCAP NIFTY" },
    { value: "NSE:NIFTYNXT50", label: "NIFTY NEXT 50" },
    { value: "NSE:CNXAUTO", label: "NIFTY AUTO" },
    { value: "NSE:CNXFMCG", label: "NIFTY FMCG" },
    { value: "NSE:CNXIT", label: "NIFTY IT" },
    { value: "NSE:CNXMETAL", label: "NIFTY METAL" },
    { value: "NSE:CNXPHARMA", label: "NIFTY PHARMA" },
    { value: "NSE:CNXPSUBANK", label: "NIFTY PSU BANK" },
    { value: "NSE:CNXREALTY", label: "NIFTY REALTY" },
    { value: "BSE:SENSEX", label: "SENSEX" },
    { value: "BSE:BANKEX", label: "BANKEX" },

    // Banking Stocks
    { value: "NSE:HDFCBANK", label: "HDFC BANK" },
    { value: "NSE:ICICIBANK", label: "ICICI BANK" },
    { value: "NSE:AXISBANK", label: "AXIS BANK" },
    { value: "NSE:KOTAKBANK", label: "KOTAK MAHINDRA BANK" },
    { value: "NSE:SBIN", label: "STATE BANK OF INDIA" },
    { value: "NSE:INDUSINDBK", label: "INDUSIND BANK" },
    { value: "NSE:BANKBARODA", label: "BANK OF BARODA" },
    { value: "NSE:PNB", label: "PUNJAB NATIONAL BANK" },

    // IT Stocks
    { value: "NSE:TCS", label: "TCS" },
    { value: "NSE:INFY", label: "INFOSYS" },
    { value: "NSE:HCLTECH", label: "HCL TECHNOLOGIES" },
    { value: "NSE:WIPRO", label: "WIPRO" },
    { value: "NSE:TECHM", label: "TECH MAHINDRA" },
    { value: "NSE:LTI", label: "LTI MINDTREE" },
    { value: "NSE:MPHASIS", label: "MPHASIS" },

    // Large Cap Stocks
    { value: "NSE:RELIANCE", label: "RELIANCE INDUSTRIES" },
    { value: "NSE:BHARTIARTL", label: "BHARTI AIRTEL" },
    { value: "NSE:ITC", label: "ITC" },
    { value: "NSE:LT", label: "LARSEN & TOUBRO" },
    { value: "NSE:HDFCLIFE", label: "HDFC LIFE" },
    { value: "NSE:SBILIFE", label: "SBI LIFE" },
    { value: "NSE:ASIANPAINT", label: "ASIAN PAINTS" },
    { value: "NSE:MARUTI", label: "MARUTI SUZUKI" },
    { value: "NSE:BAJFINANCE", label: "BAJAJ FINANCE" },
    { value: "NSE:BAJAJFINSV", label: "BAJAJ FINSERV" },

    // Pharma Stocks
    { value: "NSE:SUNPHARMA", label: "SUN PHARMA" },
    { value: "NSE:DRREDDY", label: "DR REDDY'S LAB" },
    { value: "NSE:CIPLA", label: "CIPLA" },
    { value: "NSE:DIVISLAB", label: "DIVI'S LAB" },
    { value: "NSE:BIOCON", label: "BIOCON" },

    // Auto Stocks
    { value: "NSE:TATAMOTORS", label: "TATA MOTORS" },
    { value: "NSE:M&M", label: "MAHINDRA & MAHINDRA" },
    { value: "NSE:BAJAJ-AUTO", label: "BAJAJ AUTO" },
    { value: "NSE:HEROMOTOCO", label: "HERO MOTOCORP" },
    { value: "NSE:TVSMOTOR", label: "TVS MOTOR" },

    // FMCG Stocks
    { value: "NSE:HINDUNILVR", label: "HINDUSTAN UNILEVER" },
    { value: "NSE:NESTLEIND", label: "NESTLE INDIA" },
    { value: "NSE:BRITANNIA", label: "BRITANNIA" },
    { value: "NSE:DABUR", label: "DABUR" },
    { value: "NSE:GODREJCP", label: "GODREJ CONSUMER" },

    // Metal & Mining
    { value: "NSE:TATASTEEL", label: "TATA STEEL" },
    { value: "NSE:HINDALCO", label: "HINDALCO" },
    { value: "NSE:JSWSTEEL", label: "JSW STEEL" },
    { value: "NSE:VEDL", label: "VEDANTA" },
    { value: "NSE:COALINDIA", label: "COAL INDIA" },

    // Oil & Gas
    { value: "NSE:ONGC", label: "ONGC" },
    { value: "NSE:IOC", label: "INDIAN OIL CORP" },
    { value: "NSE:BPCL", label: "BHARAT PETROLEUM" },
    { value: "NSE:HPCL", label: "HINDUSTAN PETROLEUM" },
    { value: "NSE:GAIL", label: "GAIL INDIA" },

    // Power & Utilities
    { value: "NSE:POWERGRID", label: "POWER GRID CORP" },
    { value: "NSE:NTPC", label: "NTPC" },
    { value: "NSE:ADANIPOWER", label: "ADANI POWER" },
    { value: "NSE:TATAPOWER", label: "TATA POWER" },

    // Telecom
    { value: "NSE:JIO", label: "JIO" },
    { value: "NSE:IDEA", label: "VODAFONE IDEA" },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Chart Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Live Charts</h3>
            <SymbolSearch
              symbols={symbols}
              onSymbolSelect={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Theme:</label>
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setChartTheme("light")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  chartTheme === "light"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setChartTheme("dark")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  chartTheme === "dark"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <TradingViewIframe
          symbol={selectedSymbol}
          height={400}
          theme={chartTheme}
        />
      </div>

      {/* Chart Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Current Symbol</p>
            <p className="text-sm font-semibold text-gray-800">
              {symbols.find((s) => s.value === selectedSymbol)?.label}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Exchange</p>
            <p className="text-sm font-semibold text-gray-800">
              {selectedSymbol.split(":")[0]}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Timeframe</p>
            <p className="text-sm font-semibold text-gray-800">Daily</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Timezone</p>
            <p className="text-sm font-semibold text-gray-800">IST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboard;
