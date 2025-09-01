// Development and environment configuration

interface AppConfig {
  isDevelopment: boolean;
  apiUrl: string;
}

const config: AppConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
};

export default config;
