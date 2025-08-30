# TradingView Charts Integration

This project includes TradingView chart components for displaying real-time market data in your Backtest-UI application.

## Components Created

### 1. TradingViewChart.tsx

- **Location**: `src/components/TradingViewChart.tsx`
- **Description**: Main TradingView chart component with full widget functionality
- **Export**: `TradingViewChart` (default) and `TradingViewIframe` (lightweight alternative)

### 2. ChartDashboard.tsx

- **Location**: `src/components/ChartDashboard.tsx`
- **Description**: Enhanced dashboard component with chart controls and symbol selection
- **Features**:
  - Symbol selector (NIFTY, BANKNIFTY, FINNIFTY, etc.)
  - Light/Dark theme toggle
  - Chart information display

### 3. Charts Page

- **Location**: `src/app/charts/page.tsx`
- **Description**: Dedicated charts page with multiple layout options
- **Features**:
  - Single, dual, and quad chart layouts
  - Multiple Indian market symbols
  - Responsive design

## Usage

### Basic TradingView Iframe (Recommended)

```tsx
import { TradingViewIframe } from "../components/TradingViewChart";

<TradingViewIframe
  symbol="NSE:NIFTY"
  width="100%"
  height={400}
  theme="light"
/>;
```

### Enhanced Chart Dashboard

```tsx
import ChartDashboard from "../components/ChartDashboard";

<ChartDashboard className="my-4" />;
```

### Full TradingView Widget (Advanced)

```tsx
import TradingViewChart from "../components/TradingViewChart";

<TradingViewChart
  symbol="NSE:BANKNIFTY"
  width="100%"
  height={500}
  theme="dark"
  allow_symbol_change={true}
  hideideas={true}
/>;
```

## Available Symbols

### Indian Indices

- `NSE:NIFTY` - NIFTY 50
- `NSE:BANKNIFTY` - BANK NIFTY
- `NSE:FINNIFTY` - FIN NIFTY
- `BSE:SENSEX` - SENSEX
- `BSE:BANKEX` - BANKEX

### Popular Stocks

- `NSE:RELIANCE` - Reliance Industries
- `NSE:TCS` - Tata Consultancy Services
- `NSE:HDFCBANK` - HDFC Bank
- `NSE:ICICIBANK` - ICICI Bank
- `NSE:INFY` - Infosys

## Props Reference

### TradingViewIframe Props

| Prop   | Type           | Default     | Description               |
| ------ | -------------- | ----------- | ------------------------- |
| symbol | string         | "NSE:NIFTY" | Trading symbol to display |
| width  | string/number  | "100%"      | Chart width               |
| height | string/number  | 500         | Chart height              |
| theme  | 'light'/'dark' | 'light'     | Chart theme               |

### TradingViewChart Props (Advanced)

| Prop                | Type           | Default     | Description                               |
| ------------------- | -------------- | ----------- | ----------------------------------------- |
| symbol              | string         | "NSE:NIFTY" | Trading symbol                            |
| width               | string/number  | "100%"      | Chart width                               |
| height              | string/number  | 500         | Chart height                              |
| theme               | 'light'/'dark' | 'light'     | Chart theme                               |
| style               | '1'-'9'        | '1'         | Chart style (1=Candles, 2=HLC Bars, etc.) |
| locale              | string         | 'in'        | Locale for the chart                      |
| enable_publishing   | boolean        | false       | Enable publishing features                |
| allow_symbol_change | boolean        | true        | Allow symbol changes                      |
| hideideas           | boolean        | true        | Hide trading ideas                        |
| hide_side_toolbar   | boolean        | false       | Hide side toolbar                         |
| hide_top_toolbar    | boolean        | false       | Hide top toolbar                          |

## Navigation

The application now includes:

1. **Home Page** (`/`) - Main backtesting interface with mini chart preview
2. **Charts Page** (`/charts`) - Dedicated charts page with multiple layouts

## Features

### Chart Layouts

- **Single**: One large chart with full controls
- **Dual**: Two charts side by side (NIFTY + BANKNIFTY)
- **Quad**: Four smaller charts in a grid layout

### Responsive Design

- Mobile-friendly layouts
- Adaptive chart sizes
- Touch-friendly controls

### Live Data

- Real-time market data from TradingView
- Indian timezone (Asia/Kolkata)
- Multiple timeframes support

## Integration with Backtest Data

The charts can be enhanced to show:

- Backtest entry/exit points
- Strategy performance overlay
- Historical data comparison
- Custom indicators based on your backtesting logic

## Customization

### Adding New Symbols

Edit the symbols array in `ChartDashboard.tsx`:

```tsx
const symbols = [
  { value: "NSE:NEWSTOCK", label: "NEW STOCK" },
  // ... existing symbols
];
```

### Custom Styling

All components use Tailwind CSS classes and can be customized by modifying the className props or extending the existing styles.

### Performance Optimization

- The `TradingViewIframe` component is lighter and loads faster
- Use `TradingViewChart` for advanced features but expect slower initial load
- Consider lazy loading for multiple charts

## Browser Compatibility

- Modern browsers with iframe support
- JavaScript enabled
- Internet connection required for live data

## Notes

- Charts load external content from TradingView
- Some features may require TradingView account for full functionality
- Data delay depends on TradingView's data policies
- Consider TradingView's terms of service for commercial use
