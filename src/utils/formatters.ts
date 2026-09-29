import { ethers } from 'ethers';

export function truncateAddress(address: string | null | undefined, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatMst(amount: bigint | string | number | undefined | null): string {
  if (amount === undefined || amount === null) return '0.00';
  try {
    if (typeof amount === 'bigint') {
      const formatted = ethers.formatEther(amount);
      const num = parseFloat(formatted);
      return formatNumberWithCommas(num);
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatNumberWithCommas(num);
  } catch {
    return '0.00';
  }
}

export function formatNumberWithCommas(value: number): string {
  if (isNaN(value)) return '0.00';
  // Standard format with commas
  const parts = value.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function formatIntegerWithCommas(value: number): string {
  if (isNaN(value)) return '0';
  return Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatTimeRemaining(deadlineTimestamp: number): { text: string; isExpired: boolean; urgent: boolean } {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadlineTimestamp - now;

  if (diff <= 0) {
    return { text: 'Closed', isExpired: true, urgent: false };
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) {
    return { text: `${days}d ${hours}h left`, isExpired: false, urgent: days < 1 };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m left`, isExpired: false, urgent: true };
  }
  return { text: `${minutes}m ${seconds}s left`, isExpired: false, urgent: true };
}
