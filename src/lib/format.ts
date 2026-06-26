const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const moneySignedFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  signDisplay: "always",
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});


export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return moneyFormatter.format(0);
  return moneyFormatter.format(Math.round(value));
}

export function formatMoneySigned(value: number): string {
  if (!Number.isFinite(value)) return moneySignedFormatter.format(0);
  return moneySignedFormatter.format(Math.round(value));
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return numberFormatter.format(Math.round(value));
}

export function formatDecimal(value: number): string {
  if (!Number.isFinite(value)) return "0.0";
  return decimalFormatter.format(value);
}

export function formatCompactMoney(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  if (abs >= 1_000_000) {
    const scaled = abs / 1_000_000;
    const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1);
    return `${sign}$${text.replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    const scaled = abs / 1_000;
    const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(0);
    return `${sign}$${text}K`;
  }
  return `${sign}$${abs}`;
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(digits)}%`;
}

export function ordinal(value: number): string {
  if (!Number.isFinite(value)) return "0th";
  const n = Math.round(value);
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
