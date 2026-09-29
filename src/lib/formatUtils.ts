/**
 * Formats a number according to the Indian numeral grouping system.
 * e.g., 200000 -> "2,00,000"
 */
export function formatIndianNumber(val: number): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('en-IN');
}

/**
 * Formats an MST amount with the Indian grouping and currency suffix.
 * e.g., 200000 -> "2,00,000 MST"
 */
export function formatMST(val: number): string {
  return `${formatIndianNumber(val)} MST`;
}

/**
 * Formats percentage with one decimal place.
 * e.g., 18.4 -> "+18.4%" or "65.0%"
 */
export function formatPercentage(val: number, withSign = false): string {
  const sign = withSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

/**
 * Truncates an Ethereum address in the style requested: 0x7F...3bA
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  const start = address.slice(0, 4);
  const end = address.slice(-3);
  return `${start}...${end}`;
}

/**
 * Generates an authentic-looking on-chain mock transaction hash
 */
export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
