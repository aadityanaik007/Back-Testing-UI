"use client";
import React, { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
  theme?: "light" | "dark";
  style?: "1" | "2" | "3" | "8" | "9";
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  hideideas?: boolean;
  hide_side_toolbar?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  save_image?: boolean;
  calendar?: boolean;
  hotlist?: boolean;
  news?: string[];
  details?: boolean;
  watchlist?: string[];
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "NSE:NIFTY",
  width = "100%",
  height = 500,
  theme = "light",
  style = "1",
  locale = "in",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  hideideas = true,
  hide_side_toolbar = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  calendar = false,
  hotlist = false,
  news = ["headlines"],
  details = false,
  watchlist = [
    "NSE:NIFTY",
    "NSE:BANKNIFTY",
    "NSE:FINNIFTY",
    "NSE:MIDCPNIFTY",
    "NSE:HDFCBANK",
    "NSE:ICICIBANK",
    "NSE:AXISBANK",
    "NSE:KOTAKBANK",
    "NSE:TCS",
    "NSE:INFY",
    "NSE:HCLTECH",
    "NSE:WIPRO",
    "NSE:RELIANCE",
    "NSE:BHARTIARTL",
    "NSE:ITC",
    "NSE:LT",
    "NSE:SUNPHARMA",
    "NSE:ASIANPAINT",
    "NSE:MARUTI",
    "NSE:BAJFINANCE",
    "BSE:SENSEX",
    "BSE:BANKEX",
  ],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = "";

      // Create the TradingView widget
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;

      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: width === "100%",
            width: width,
            height: height,
            symbol: symbol,
            interval: "D",
            timezone: "Asia/Kolkata",
            theme: theme,
            style: style,
            locale: locale,
            toolbar_bg: toolbar_bg,
            enable_publishing: enable_publishing,
            allow_symbol_change: allow_symbol_change,
            container_id: containerRef.current?.id || "tradingview_widget",
            hideideas: hideideas,
            hide_side_toolbar: hide_side_toolbar,
            hide_top_toolbar: hide_top_toolbar,
            hide_legend: hide_legend,
            save_image: save_image,
            calendar: calendar,
            hotlist: hotlist,
            news: news,
            details: details,
            watchlist: watchlist,
          });
        }
      };

      // Generate unique ID for the container
      const uniqueId = `tradingview_${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = uniqueId;

      document.head.appendChild(script);

      return () => {
        // Cleanup
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [
    symbol,
    width,
    height,
    theme,
    style,
    locale,
    toolbar_bg,
    enable_publishing,
    allow_symbol_change,
    hideideas,
    hide_side_toolbar,
    hide_top_toolbar,
    hide_legend,
    save_image,
    calendar,
    hotlist,
    news,
    details,
    watchlist,
  ]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
};

// Simple iframe-based alternative (lighter weight)
export const TradingViewIframe: React.FC<{
  symbol?: string;
  width?: string | number;
  height?: string | number;
  theme?: "light" | "dark";
}> = ({
  symbol = "NSE:NIFTY",
  width = "100%",
  height = 500,
  theme = "light",
}) => {
  // Improved iframe URL to remove popup messages and enhance functionality
  const src = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
    symbol
  )}&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&hideideas=1&theme=${theme}&style=1&timezone=Asia%2FKolkata&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%22use_localstorage_for_settings%22%2C%22create_volume_indicator_by_default%22%2C%22header_symbol_search%22%2C%22popup_hints%22%2C%22header_screenshot%22%2C%22header_widget_dom_node%22%2C%22header_saveload%22%2C%22header_undo_redo%22%2C%22header_compare%22%2C%22header_chart_type%22%2C%22header_settings%22%2C%22left_toolbar%22%2C%22context_menus%22%2C%22control_bar%22%2C%22timeframes_toolbar%22%5D&locale=in&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${encodeURIComponent(
    symbol
  )}&referrer=localhost&widget_colors=%7B%7D&hide_legend=false&hide_side_toolbar=false&allow_symbol_change=true&details=false&hotlist=false&calendar=false&show_popup=false&popup_width=1000&popup_height=650&no_referral_id=true`;

  return (
    <div
      className="tradingview-iframe-container"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        allowTransparency={true}
        scrolling="no"
        style={{
          border: "none",
          borderRadius: "8px",
        }}
        title={`TradingView Chart - ${symbol}`}
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

// Types for window.TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

export default TradingViewChart;
