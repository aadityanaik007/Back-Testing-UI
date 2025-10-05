import { apiClient } from "@/lib/apiClient";

export interface BullCreditData {
  success: boolean;
  data: Array<{
    [key: string]: any; // This will be typed properly once we know the exact structure
  }>;
  total_records: number;
}

export interface BullCreditSummary {
  total_records: number;
  columns: string[];
  numeric_stats: {
    [column: string]: {
      min: number;
      max: number;
      mean: number;
      median: number;
    };
  };
}

export const bullCreditApi = {
  /**
   * Get all data from bull_credit.csv
   */
  getData: async (): Promise<BullCreditData> => {
    const response = await apiClient.get("/api/bull-credit/data");
    return response.data;
  },

  /**
   * Get summary statistics of bull_credit.csv
   */
  getSummary: async (): Promise<BullCreditSummary> => {
    const response = await apiClient.get("/api/bull-credit/summary");
    return response.data;
  },
};
