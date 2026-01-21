/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import type { Currency, Rates } from "@/types/currency";

// Given exchange equivalents (NGN per unit):
// 1 USD = ₦1,420.26 NGN
// 1 EUR = ₦1,664.20 NGN
// 1 GBP = ₦1,908.98 NGN
// We'll compute rates as "units per 1 USD" so `convertUsdTo(amountUsd, to)` can multiply.
const baseUsdToNgn = 1420.26;
const defaultRates: Rates = {
  USD: 1,
  NGN: baseUsdToNgn,
  EUR: baseUsdToNgn / 1664.2, // ~0.853 EUR per 1 USD
  GBP: baseUsdToNgn / 1908.98, // ~0.744 GBP per 1 USD
};

const localeMap: Record<Currency, string> = {
  USD: "en-US",
  NGN: "en-NG",
  GBP: "en-GB",
  EUR: "de-DE",
};

const symbolMap: Record<Currency, string> = {
  USD: "$",
  NGN: "₦",
  GBP: "£",
  EUR: "€",
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  setRates: (r: Rates) => void;
  formatPrice: (amountUsd: number) => string;
  formatLocalPrice: (amount: number) => string; // Format without conversion
  convertUsdTo: (amountUsd: number, to?: Currency) => number;
  convertToUsd: (amount: number, from?: Currency) => number;
};

const CurrencyContext = React.createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('app_currency') : null;
  const initialCurrency = (stored && (['USD','NGN','GBP','EUR'] as string[]).includes(stored) ? (stored as Currency) : 'NGN') as Currency;
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
      currency: currency === "USD" ? "USD" : currency === "NGN" ? "NGN" : currency === "GBP" ? "GBP" : "EUR",
      maximumFractionDigits: 0,
    });
    // Intl for NGN/GBP will include symbol; fallback to symbolMap if needed
    try {
      return formatter.format(amt);
    } catch (e) {
      return `${symbolMap[currency]}${amt.toFixed(0)}`;
    }
  }, [convertUsdTo, currency]);

  // Format price without conversion (for prices already in local currency)
  const formatLocalPrice = React.useCallback((amount: number) => {
    const formatter = new Intl.NumberFormat(localeMap[currency], {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "NGN" ? "NGN" : currency === "GBP" ? "GBP" : "EUR",
      maximumFractionDigits: 0,
    });
    try {
      return formatter.format(amount);
    } catch (e) {
      return `${symbolMap[currency]}${amount.toFixed(0)}`;
    }
  }, [currency]);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    rates,
    setRates,
    formatPrice,
    formatLocalPrice,
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

// Note: `Currency` type is exported from `src/types/currency.ts`
