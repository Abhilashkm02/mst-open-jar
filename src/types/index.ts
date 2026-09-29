export type JarStatus = 
  | 'FUNDING_OPEN'
  | 'TARGET_REACHED'
  | 'ALLOTMENT_PENDING'
  | 'ALLOTTED'
  | 'REFUND_PROCESSING'
  | 'UPCOMING';

export interface IpoJar {
  id: string;
  contractAddress: string;
  companyName: string;
  symbol: string;
  sector: string;
  description: string;
  logo: string;
  fractionPrice: bigint; // In wei / MST atomic units
  fractionPriceFormatted: string; // e.g. "2,500 MST"
  totalFractions: number;
  fractionsSold: number;
  totalLotTargetFormatted: string; // e.g. "2,50,000 MST"
  minimumEntryFormatted: string; // e.g. "2,500 MST (1 Fraction)"
  deadlineTimestamp: number;
  isSoldOut: boolean;
  lotPurchased: boolean;
  returnsDistributed: boolean;
  totalReturns: bigint;
  totalReturnsFormatted: string;
  listingGainPercent?: number; // e.g. +38.5%
  isLiveContract: boolean; // True for the provided smart contract
  status: JarStatus;
  retailReservation: string; // e.g. "35% Retail Quota"
  lotSize: number; // e.g. 1000 shares per lot
  issuePriceBand: string; // e.g. "₹240 - ₹252"
  leadManager: string;
  riskRating: 'Low' | 'Moderate' | 'High';
  allotmentDateFormatted: string; // e.g. "Oct 02, 2026"
  allotmentReason: string; // e.g. Reason for succeeded or failed allotment
}

export interface UserPosition {
  jarId: string;
  contractAddress: string;
  companyName: string;
  symbol: string;
  fractionsOwned: number;
  investedMst: string;
  sharePercentage: string;
  status: JarStatus;
  isAllotted: boolean;
  isRefundable: boolean;
  refundableAmount: string;
  claimableReturns: string;
  hasClaimed: boolean;
  isLiveContract: boolean;
  allotmentDateFormatted: string;
  allotmentReason: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'pending';
  title: string;
  description?: string;
  txHash?: string;
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  balance: string; // MST balance
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDemoMode: boolean;
  walletName: string;
}
