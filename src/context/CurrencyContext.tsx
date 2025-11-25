import * as React from "react";

type Currency = "USD" | "NGN" | "GBP";

type Rates = Record<Currency, number>;

const defaultRates: Rates = {
  // rates are currency units per 1 USD (approximate defaults)
  USD: 1,
  NGN: 1500, // fallback value; consider refreshing from an API
  GBP: 0.78,
};

const localeMap: Record<Currency, string> = {
  USD: "en-US",
  NGN: "en-NG",
  GBP: "en-GB",
};

const symbolMap: Record<Currency, string> = {
  USD: "$",
  NGN: "₦",
  GBP: "£",
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  setRates: (r: Rates) => void;
  formatPrice: (amountUsd: number) => string;
  convertUsdTo: (amountUsd: number, to?: Currency) => number;
  convertToUsd: (amount: number, from?: Currency) => number;
};

const CurrencyContext = React.createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('app_currency') : null;
  const initialCurrency = (stored && (['USD','NGN','GBP'] as string[]).includes(stored) ? (stored as Currency) : 'NGN') as Currency;
  const [currency, setCurrencyState] = React.useState<Currency>(initialCurrency);
  const [rates, setRates] = React.useState<Rates>(defaultRates);

  // persist currency selection
  React.useEffect(() => {
    try {
      window.localStorage.setItem('app_currency', currency);
    } catch (e) {
      // ignore
    }
  }, [currency]);

  const setCurrency = React.useCallback((c: Currency) => {
    setCurrencyState(c);
  }, []);

  const convertUsdTo = React.useCallback((amountUsd: number, to: Currency = currency) => {
    const rate = rates[to] ?? 1;
    return amountUsd * rate;
  }, [rates, currency]);

  const convertToUsd = React.useCallback((amount: number, from: Currency = currency) => {
    const rate = rates[from] ?? 1;
    return amount / rate;
  }, [rates, currency]);

  const formatPrice = React.useCallback((amountUsd: number) => {
    const amt = convertUsdTo(amountUsd, currency);
    const formatter = new Intl.NumberFormat(localeMap[currency], {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "NGN" ? "NGN" : "GBP",
      maximumFractionDigits: 0,
    });
    // Intl for NGN/GBP will include symbol; fallback to symbolMap if needed
    try {
      return formatter.format(amt);
    } catch (e) {
      return `${symbolMap[currency]}${amt.toFixed(0)}`;
    }
  }, [convertUsdTo, currency]);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    rates,
    setRates,
    formatPrice,
    convertUsdTo,
    convertToUsd,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};

export type { Currency };
