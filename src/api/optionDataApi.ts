import { apiClient } from "@/lib/apiClient";

export interface OptionData {
  date: string;
  data: Array<{
    Symbol: string;
    Strike_Price: number;
    Option_Type: string;
    [key: string]: any; // For other fields in the data
  }>;
}

export interface OptionDataSummary {
  date: string;
  total_records: number;
  symbols: string[];
  strike_prices: number[];
  option_types: string[];
}

export interface AvailableDates {
  [year: string]: string[]; // year -> list of dates
}

export const optionDataApi = {
  /**
   * Get all available dates for which option data exists
   */
  getAvailableDates: async (): Promise<AvailableDates> => {
    const response = await apiClient.get("/api/option-data/available-dates");
    return response.data;
  },

  /**
   * Get option data for a specific date
   * @param date Date in YYYY-MM-DD format
   */
  getOptionData: async (date: string): Promise<OptionData> => {
    const response = await apiClient.get(`/api/option-data/data/${date}`);
    return response.data;
  },

  /**
   * Get a summary of option data for a specific date
   * @param date Date in YYYY-MM-DD format
   */
  getOptionDataSummary: async (date: string): Promise<OptionDataSummary> => {
    const response = await apiClient.get(`/api/option-data/summary/${date}`);
    return response.data;
  },
};
