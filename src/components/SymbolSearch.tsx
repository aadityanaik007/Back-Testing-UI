"use client";
import React, { useState, useMemo } from "react";

interface SymbolSearchProps {
  symbols: { value: string; label: string }[];
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({
  symbols,
  onSymbolSelect,
  selectedSymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredSymbols = useMemo(() => {
    if (!searchTerm) return symbols.slice(0, 10);
    return symbols
      .filter(
        (symbol) =>
          symbol.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          symbol.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 20); // Limit to 20 results
  }, [symbols, searchTerm]);

  const handleSymbolClick = (symbolValue: string) => {
    onSymbolSelect(symbolValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedSymbolLabel =
    symbols.find((s) => s.value === selectedSymbol)?.label || selectedSymbol;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Symbol:</label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between min-w-[200px] px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
          >
            <span className="truncate">{selectedSymbolLabel}</span>
            <svg
              className={`ml-2 h-4 w-4 transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search symbols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
              </div>

              {/* Symbol List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredSymbols.length > 0 ? (
                  filteredSymbols.map((symbol) => (
                    <button
                      key={symbol.value}
                      onClick={() => handleSymbolClick(symbol.value)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                        symbol.value === selectedSymbol
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{symbol.label}</span>
                        <span className="text-xs text-gray-500">
                          {symbol.value.split(":")[0]}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No symbols found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>

              {/* Categories */}
              {!searchTerm && (
                <div className="border-t border-gray-200 p-2 bg-gray-50">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <button
                      onClick={() => setSearchTerm("NSE:NIFTY")}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Indices
                    </button>
                    <button
                      onClick={() => setSearchTerm("BANK")}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Banking
                    </button>
                    <button
                      onClick={() => setSearchTerm("IT")}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    >
                      IT Stocks
                    </button>
                    <button
                      onClick={() => setSearchTerm("PHARMA")}
                      className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Pharma
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default SymbolSearch;
