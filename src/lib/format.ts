export const currency = (n: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n);

export const currencyPrecise = (n: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n);

export const number = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const shortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
