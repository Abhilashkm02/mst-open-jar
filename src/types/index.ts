export type Sector = 'Tech' | 'Manufacturing' | 'Health' | 'Agri' | 'Retail';

export type JarStatus = 'OPEN' | 'LOCKED' | 'FAILED' | 'ALLOTTED';

export interface IpoJar {
  id: string; // e.g. 'JAR-014'
  name: string; // e.g. 'TechNova AI'
  symbol: string; // e.g. 'TNOVA'
  sector: Sector;
  description: string;
  targetMst: number; // e.g. 200000
  currentMst: number; // e.g. 130000
  minInvestmentMst: number; // e.g. 2000
  fundedPercent: number; // e.g. 65
  status: JarStatus;
  statusLabel: string; // e.g. 'Funding Open', 'Target Reached', 'Bid Failed', 'Allotted & Sold'
  investorsCount: number;
  closesIn: string; // e.g. '2d 14h'
  allotmentDate: string; // e.g. '04 Oct 2026'
  issuePriceBand: string; // e.g. '₹185 - ₹195'
  leadManager: string; // e.g. 'Edelweiss Capital'
  retailReservation: string; // e.g. '35% Retail Quota'
  lotSize: number; // e.g. 1,000 shares
  contractAddress: string;
  isFeatured?: boolean;
  finalReturnPercent?: number; // e.g. 18.4 for UrbanLoom
  failureReason?: string; // e.g. 'Exchange allotment draw missed due to 48x oversubscription'
}

export interface UserInvestment {
  jarId: string;
  investedMst: number;
  poolSharePercent: number;
  status: JarStatus;
  claimableMst: number;
  realizedProfitMst: number;
  isClaimed: boolean;
  claimedTxHash?: string;
  contractAddress: string;
  settledDate?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'error';
  txHash?: string;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string;
  truncatedAddress: string;
  balance: number;
  network: string;
  chainId: number;
  isRealWeb3?: boolean;
  signer?: any;
}
