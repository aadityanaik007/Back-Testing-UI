"use client";

import { useEffect, useState } from "react";
import {
  bullCreditApi,
  BullCreditData,
  BullCreditSummary,
} from "@/api/bullCreditApi";
import Header from "@/components/Header";

export default function BullCreditPage() {
  const [data, setData] = useState<BullCreditData | null>(null);
  const [summary, setSummary] = useState<BullCreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dataResponse, summaryResponse] = await Promise.all([
          bullCreditApi.getData(),
          bullCreditApi.getSummary(),
        ]);
        setData(dataResponse);
        setSummary(summaryResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header activeTab="bull-credit" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header activeTab="bull-credit" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab="bull-credit" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">
                  Total Records
                </p>
                <p className="text-2xl font-bold">{summary.total_records}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                  Available Columns
                </p>
                <p className="text-sm">{summary.columns.join(", ")}</p>
              </div>
            </div>

            {/* Numeric Statistics */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">
                Numeric Column Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(summary.numeric_stats).map(
                  ([column, stats]) => (
                    <div key={column} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {column}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>Min: {stats.min.toFixed(2)}</p>
                        <p>Max: {stats.max.toFixed(2)}</p>
                        <p>Mean: {stats.mean.toFixed(2)}</p>
                        <p>Median: {stats.median.toFixed(2)}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Bull Credit Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(data.data[0]).map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
