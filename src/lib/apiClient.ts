import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This is important for handling cookies/sessions
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle response errors here
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
