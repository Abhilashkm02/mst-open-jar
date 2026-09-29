'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { IpoJar, UserPosition, JarStatus } from '@/types';
import { contractService } from '@/contracts/contractService';
import { IPO_CONTRACT_ADDRESS } from '@/contracts/ipoContractAbi';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';
import { triggerConfetti } from '@/utils/confetti';
import { formatMst, formatIntegerWithCommas } from '@/utils/formatters';

interface IpoContextType {
  jars: IpoJar[];
  userPositions: UserPosition[];
  isLoading: boolean;
  selectedJar: IpoJar | null;
  setSelectedJar: (jar: IpoJar | null) => void;
  investInJar: (jarId: string, fractionCount: number) => Promise<boolean>;
  claimRefund: (jarId: string) => Promise<boolean>;
  claimReturns: (jarId: string) => Promise<boolean>;
  executeLotPurchase: (jarId: string) => Promise<boolean>;
  distributeGains: (jarId: string, gainsAmountMst: number) => Promise<boolean>;
  refreshPoolData: () => Promise<void>;
  filterSector: string;
  setFilterSector: (sector: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const INITIAL_JARS: IpoJar[] = [
  {
    id: 'live-contract-jar',
    contractAddress: IPO_CONTRACT_ADDRESS,
    companyName: 'AeroPulse Defence Tech SME',
    symbol: 'AEROPULSE',
    sector: 'Defence & Avionics',
    description: 'Indigenous UAV autopilot navigation and next-gen electronic warfare payload systems for aerospace primes.',
    logo: '🛡️',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 100,
    fractionsSold: 64,
    totalLotTargetFormatted: '100 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) + 86400 * 2.5,
    isSoldOut: false,
    lotPurchased: false,
    returnsDistributed: false,
    totalReturns: BigInt(0),
    totalReturnsFormatted: '0.00 MST',
    listingGainPercent: 36.5,
    isLiveContract: true,
    status: 'FUNDING_OPEN',
    retailReservation: '35% Retail Quota',
    lotSize: 1000,
    issuePriceBand: '1 MST',
    leadManager: 'MST Capital Advisors Ltd',
    riskRating: 'Moderate',
    allotmentDateFormatted: 'Oct 04, 2026',
    allotmentReason: 'Pool gathering (64% funded). Allotment draw scheduled upon 100% target lock.',
  },
  {
    id: 'jar-hyperion',
    contractAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    companyName: 'Hyperion Green Ammonia SME',
    symbol: 'HYPERION',
    sector: 'CleanTech & ESG',
    description: 'Modular green ammonia generation units leveraging zero-carbon electrolyzers for agricultural and fertilizer supply chains.',
    logo: '🌱',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 120,
    fractionsSold: 98,
    totalLotTargetFormatted: '120 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) + 86400 * 1.2,
    isSoldOut: false,
    lotPurchased: false,
    returnsDistributed: false,
    totalReturns: BigInt(0),
    totalReturnsFormatted: '0.00 MST',
    listingGainPercent: 28.0,
    isLiveContract: false,
    status: 'FUNDING_OPEN',
    retailReservation: '40% Retail Quota',
    lotSize: 1200,
    issuePriceBand: '1 MST',
    leadManager: 'Apex Global Merchant Bankers',
    riskRating: 'Low',
    allotmentDateFormatted: 'Oct 03, 2026',
    allotmentReason: 'Pool in progress (82% funded). Allotment basis finalized upon reaching 100% target.',
  },
  {
    id: 'jar-voltmatrix',
    contractAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    companyName: 'VoltMatrix EV Powertrain SME',
    symbol: 'VOLT',
    sector: 'EV Mobility',
    description: 'High-torque silicon-carbide motor controllers for commercial light electric vehicles and heavy agricultural machinery.',
    logo: '⚡',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 80,
    fractionsSold: 80,
    totalLotTargetFormatted: '80 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) - 3600,
    isSoldOut: true,
    lotPurchased: false,
    returnsDistributed: false,
    totalReturns: BigInt(0),
    totalReturnsFormatted: '0.00 MST',
    listingGainPercent: 44.0,
    isLiveContract: false,
    status: 'TARGET_REACHED',
    retailReservation: '35% Retail Quota',
    lotSize: 800,
    issuePriceBand: '1 MST',
    leadManager: 'Beacon FinTech Capital',
    riskRating: 'Moderate',
    allotmentDateFormatted: 'Oct 01, 2026',
    allotmentReason: 'Target 100% Reached & Locked. Computerized registrar lottery draw in progress for lot confirmation.',
  },
  {
    id: 'jar-aegis',
    contractAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    companyName: 'Aegis Quantum Sensor SME',
    symbol: 'AEGIS',
    sector: 'DeepTech',
    description: 'Diamond nitrogen-vacancy magnetic field sensors engineered for sub-micron medical imaging and autonomous navigation.',
    logo: '💎',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 100,
    fractionsSold: 100,
    totalLotTargetFormatted: '100 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
    isSoldOut: true,
    lotPurchased: true,
    returnsDistributed: true,
    totalReturns: ethers.parseEther('142'),
    totalReturnsFormatted: '142 MST',
    listingGainPercent: 42.0,
    isLiveContract: false,
    status: 'ALLOTTED',
    retailReservation: '35% Retail Quota',
    lotSize: 1000,
    issuePriceBand: '1 MST',
    leadManager: 'Vanguard Merchant Bank',
    riskRating: 'High',
    allotmentDateFormatted: 'Sep 27, 2026',
    allotmentReason: 'Allotment Succeeded: 100% Jar Lot Target Reached • Valid Registrar Draw • Full SME lot allocated on-chain with +42% listing day gain.',
  },
  {
    id: 'jar-bionova',
    contractAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    companyName: 'BioNova NanoPharma SME',
    symbol: 'BIONOVA',
    sector: 'Biopharma',
    description: 'Targeted liposomal oncology drug delivery vectors advancing through Phase II human clinical trials.',
    logo: '🧬',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 100,
    fractionsSold: 42,
    totalLotTargetFormatted: '100 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) - 86400,
    isSoldOut: false,
    lotPurchased: false,
    returnsDistributed: false,
    totalReturns: BigInt(0),
    totalReturnsFormatted: '0.00 MST',
    listingGainPercent: 0,
    isLiveContract: false,
    status: 'REFUND_PROCESSING',
    retailReservation: '35% Retail Quota',
    lotSize: 1000,
    issuePriceBand: '1 MST',
    leadManager: 'Heritage Financial Partners',
    riskRating: 'High',
    allotmentDateFormatted: 'Sep 28, 2026',
    allotmentReason: 'Allotment Failed: Issue oversubscribed 48.2x in retail category; syndicate lot bid was not drawn in computerized lottery. 100% principal refund available.',
  },
  {
    id: 'jar-zenith',
    contractAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    companyName: 'Kisan AgriCloud IoT SME',
    symbol: 'KISAN',
    sector: 'AgriTech',
    description: 'Decentralized satellite telemetry and hyper-local soil moisture sensor mesh networks for precision farming.',
    logo: '🌾',
    fractionPrice: ethers.parseEther('1'),
    fractionPriceFormatted: '1 MST',
    totalFractions: 150,
    fractionsSold: 0,
    totalLotTargetFormatted: '150 MST',
    minimumEntryFormatted: '1 MST (1 Fraction)',
    deadlineTimestamp: Math.floor(Date.now() / 1000) + 86400 * 5,
    isSoldOut: false,
    lotPurchased: false,
    returnsDistributed: false,
    totalReturns: BigInt(0),
    totalReturnsFormatted: '0.00 MST',
    listingGainPercent: 32.0,
    isLiveContract: false,
    status: 'UPCOMING',
    retailReservation: '50% Retail Quota',
    lotSize: 1500,
    issuePriceBand: '140 - 150 MST',
    leadManager: 'Rural Horizons Finance',
    riskRating: 'Low',
    allotmentDateFormatted: 'Oct 08, 2026',
    allotmentReason: 'Upcoming Issue: Pool opens in 5 days. Allotment scheduled following subscription closure.',
  }
];

const IpoContext = createContext<IpoContextType | undefined>(undefined);

export const IpoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jars, setJars] = useState<IpoJar[]>(INITIAL_JARS);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedJar, setSelectedJar] = useState<IpoJar | null>(null);
  const [filterSector, setFilterSector] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { address, isConnected, isDemoMode, signer, provider, refreshBalance, connectWallet } = useWallet();
  const { showSuccess, showError, showPending, updateToast } = useToast();

  // Determine status based on pool variables
  const determineStatus = (
    sold: number,
    total: number,
    isSoldOut: boolean,
    lotPurchased: boolean,
    returnsDistributed: boolean,
    deadline: number
  ): JarStatus => {
    if (returnsDistributed) return 'ALLOTTED';
    if (lotPurchased) return 'ALLOTTED';
    if (isSoldOut || sold >= total) return 'TARGET_REACHED';
    if (deadline < Math.floor(Date.now() / 1000)) return 'REFUND_PROCESSING';
    return 'FUNDING_OPEN';
  };

  // Sync Live Contract State
  const refreshPoolData = useCallback(async () => {
    try {
      setIsLoading(true);
      const liveData = await contractService.fetchPoolStatus(provider || undefined);

      if (liveData) {
        setJars((prevJars) =>
          prevJars.map((jar) => {
            if (jar.isLiveContract) {
              const status = determineStatus(
                liveData.fractionsSold,
                liveData.totalFractions,
                liveData.isSoldOut,
                liveData.lotPurchased,
                liveData.returnsDistributed,
                liveData.deadline
              );

              const priceFormatted = `${formatMst(liveData.fractionPrice)} MST`;
              const targetBigInt = liveData.fractionPrice * BigInt(liveData.totalFractions);
              const targetFormatted = `${formatMst(targetBigInt)} MST`;

              return {
                ...jar,
                companyName: liveData.companyName || jar.companyName,
                fractionPrice: liveData.fractionPrice,
                fractionPriceFormatted: priceFormatted,
                totalFractions: liveData.totalFractions,
                fractionsSold: liveData.fractionsSold,
                totalLotTargetFormatted: targetFormatted,
                minimumEntryFormatted: `${priceFormatted} (1 Fraction)`,
                deadlineTimestamp: liveData.deadline,
                isSoldOut: liveData.isSoldOut,
                lotPurchased: liveData.lotPurchased,
                returnsDistributed: liveData.returnsDistributed,
                totalReturns: liveData.totalReturns,
                totalReturnsFormatted: `${formatMst(liveData.totalReturns)} MST`,
                status,
                allotmentDateFormatted: jar.allotmentDateFormatted || 'Oct 04, 2026',
                allotmentReason: status === 'ALLOTTED' 
                  ? 'Allotment Succeeded: 100% Jar Lot Target Reached • Valid Registrar Draw • Full SME lot allocated on-chain with listing gains.'
                  : status === 'TARGET_REACHED'
                  ? 'Target 100% Reached & Locked. Computerized registrar lottery draw in progress for lot confirmation.'
                  : jar.allotmentReason || 'Pool actively gathering (64% funded). Allotment draw scheduled upon 100% target lock.',
              };
            }
            return jar;
          })
        );
      }
    } catch (err) {
      console.warn('Live contract poll error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Sync User Positions
  const refreshUserPositions = useCallback(async () => {
    if (!address) {
      setUserPositions([]);
      return;
    }

    try {
      // 1. Fetch live contract user fractions
      let liveUserFractions = 0;
      if (!isDemoMode && provider) {
        liveUserFractions = await contractService.fetchUserFractions(address, provider);
      } else {
        const savedDemoHoldings = localStorage.getItem(`demo_holdings_${address}`);
        if (savedDemoHoldings) {
          const parsed = JSON.parse(savedDemoHoldings);
          liveUserFractions = parsed['live-contract-jar'] || 0;
        }
      }

      // Read local storage for simulated holdings
      const localHoldings: Record<string, number> = JSON.parse(
        localStorage.getItem(`demo_holdings_${address}`) || '{}'
      );

      // Default demo initial holdings for showcase if empty
      if (Object.keys(localHoldings).length === 0 && isDemoMode) {
        localHoldings['jar-voltmatrix'] = 5; // 5 fractions of VoltMatrix
        localHoldings['jar-aegis'] = 10;      // 10 fractions of Aegis
        localHoldings['jar-bionova'] = 4;     // 4 fractions of BioNova (Refundable)
        localStorage.setItem(`demo_holdings_${address}`, JSON.stringify(localHoldings));
      }

      const positions: UserPosition[] = [];

      jars.forEach((jar) => {
        let fractions = 0;
        if (jar.isLiveContract) {
          fractions = isDemoMode ? (localHoldings['live-contract-jar'] || 0) : liveUserFractions;
        } else {
          fractions = localHoldings[jar.id] || 0;
        }

        if (fractions > 0) {
          const investedVal = jar.fractionPrice * BigInt(fractions);
          const sharePct = ((fractions / jar.totalFractions) * 100).toFixed(2);
          
          let claimable = '0.00 MST';
          if (jar.status === 'ALLOTTED') {
            // Proportional share of total returns
            const totalRet = jar.totalReturns > BigInt(0) 
              ? jar.totalReturns 
              : investedVal + (investedVal * BigInt(Math.floor((jar.listingGainPercent || 35)))) / BigInt(100);
            const userRet = (totalRet * BigInt(fractions)) / BigInt(jar.totalFractions);
            claimable = `${formatMst(userRet)} MST`;
          }

          const hasClaimedKey = `claimed_${jar.id}_${address}`;
          const hasClaimed = localStorage.getItem(hasClaimedKey) === 'true';

          let allotmentReason = jar.allotmentReason;
          if (jar.status === 'ALLOTTED') {
            allotmentReason = 'Allotment Succeeded: 100% Jar Lot Target Reached • Valid Registrar Draw • Full SME lot allocated on-chain with listing gains.';
          } else if (jar.status === 'REFUND_PROCESSING') {
            allotmentReason = 'Allotment Failed: Issue oversubscribed 48.2x in retail category; syndicate lot bid was not drawn in computerized lottery. 100% principal refund available.';
          } else if (jar.status === 'TARGET_REACHED') {
            allotmentReason = 'Allotment In Progress: Jar reached 100% target and locked. Registrar basis of allotment scheduled for draw.';
          } else {
            allotmentReason = `Funding In Progress: Pool actively gathering. Allotment scheduled on ${jar.allotmentDateFormatted}.`;
          }

          positions.push({
            jarId: jar.id,
            contractAddress: jar.contractAddress,
            companyName: jar.companyName,
            symbol: jar.symbol,
            fractionsOwned: fractions,
            investedMst: `${formatMst(investedVal)} MST`,
            sharePercentage: `${sharePct}%`,
            status: jar.status,
            isAllotted: jar.status === 'ALLOTTED',
            isRefundable: jar.status === 'REFUND_PROCESSING',
            refundableAmount: `${formatMst(investedVal)} MST`,
            claimableReturns: claimable,
            hasClaimed,
            isLiveContract: jar.isLiveContract,
            allotmentDateFormatted: jar.allotmentDateFormatted,
            allotmentReason,
          });
        }
      });

      setUserPositions(positions);
    } catch (err) {
      console.warn('Error syncing user positions:', err);
    }
  }, [address, isDemoMode, provider, jars]);

  // Initial load & Polling
  useEffect(() => {
    refreshPoolData();
  }, [refreshPoolData]);

  useEffect(() => {
    refreshUserPositions();
  }, [refreshUserPositions]);

  // Invest in Jar action (Buy Fraction)
  const investInJar = useCallback(
    async (jarId: string, fractionCount: number): Promise<boolean> => {
      if (!isConnected || !address) {
        showError('Wallet Not Connected', 'Please connect your Bridgekey wallet to invest.');
        await connectWallet();
        return false;
      }

      const targetJar = jars.find((j) => j.id === jarId);
      if (!targetJar) {
        showError('Invalid Jar', 'The selected IPO Jar was not found.');
        return false;
      }

      if (targetJar.fractionsSold + fractionCount > targetJar.totalFractions) {
        showError('Exceeds Target Limit', `Only ${targetJar.totalFractions - targetJar.fractionsSold} fractions available.`);
        return false;
      }

      const totalCostWei = targetJar.fractionPrice * BigInt(fractionCount);
      const formattedCost = `${formatMst(totalCostWei)} MST`;

      // If Live Smart Contract and NOT in demo mode with live signer
      if (targetJar.isLiveContract && !isDemoMode && signer) {
        const toastId = showPending(
          'Transaction Pending...',
          `Broadcasting buyFraction transaction for ${fractionCount} fraction(s) (${formattedCost}) to MST chain.`
        );

        try {
          const receipt = await contractService.buyFraction(signer, totalCostWei);

          updateToast(toastId, {
            type: 'success',
            title: 'Investment Confirmed!',
            description: `Successfully pooled ${formattedCost} for ${fractionCount} fraction(s) of ${targetJar.companyName}.`,
            txHash: receipt?.hash,
          });

          triggerConfetti();
          await refreshPoolData();
          await refreshBalance();
          await refreshUserPositions();
          return true;
        } catch (error: any) {
          console.error('buyFraction error:', error);
          updateToast(toastId, {
            type: 'error',
            title: 'Transaction Failed',
            description: error?.reason || error?.message || 'Transaction rejected on chain.',
          });
          return false;
        }
      }

      // Demo Mode or Simulated Jar execution
      const toastId = showPending(
        'Processing Pool Investment...',
        `Allocating ${fractionCount} fraction(s) in ${targetJar.companyName} jar...`
      );

      await new Promise((res) => setTimeout(res, 1200));

      // Update local storage
      const holdings = JSON.parse(localStorage.getItem(`demo_holdings_${address}`) || '{}');
      holdings[jarId] = (holdings[jarId] || 0) + fractionCount;
      localStorage.setItem(`demo_holdings_${address}`, JSON.stringify(holdings));

      // Deduct demo balance
      const currentBal = parseFloat(localStorage.getItem('sme_demo_balance') || '125000');
      const costNumber = parseFloat(ethers.formatEther(totalCostWei));
      const newBal = Math.max(0, currentBal - costNumber).toFixed(2);
      localStorage.setItem('sme_demo_balance', newBal);

      // Update in-memory jar status
      setJars((prev) =>
        prev.map((j) => {
          if (j.id === jarId) {
            const newSold = j.fractionsSold + fractionCount;
            const isSoldOut = newSold >= j.totalFractions;
            return {
              ...j,
              fractionsSold: newSold,
              isSoldOut,
              status: isSoldOut ? 'TARGET_REACHED' : j.status,
            };
          }
          return j;
        })
      );

      updateToast(toastId, {
        type: 'success',
        title: 'Investment Confirmed!',
        description: `Successfully pooled ${formattedCost} for ${fractionCount} fraction(s) of ${targetJar.companyName}. Position added to My Portfolio.`,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });

      triggerConfetti();
      await refreshBalance();
      await refreshUserPositions();
      return true;
    },
    [isConnected, address, jars, isDemoMode, signer, showPending, updateToast, showError, refreshPoolData, refreshBalance, refreshUserPositions, connectWallet]
  );

  // Claim Refund
  const claimRefund = useCallback(
    async (jarId: string): Promise<boolean> => {
      if (!isConnected || !address) {
        showError('Connect Wallet', 'Please connect your Bridgekey wallet to claim refunds.');
        return false;
      }

      const targetJar = jars.find((j) => j.id === jarId);
      if (!targetJar) return false;

      const toastId = showPending(
        'Claiming Refund...',
        `Withdrawing invested MST from ${targetJar.companyName} jar...`
      );

      if (targetJar.isLiveContract && !isDemoMode && signer) {
        try {
          const receipt = await contractService.claimReturns(signer);
          updateToast(toastId, {
            type: 'success',
            title: 'Refund Claimed!',
            description: `Full refund has been credited back to your Bridgekey wallet.`,
            txHash: receipt?.hash,
          });
          triggerConfetti();
          await refreshPoolData();
          await refreshBalance();
          await refreshUserPositions();
          return true;
        } catch (err: any) {
          updateToast(toastId, {
            type: 'error',
            title: 'Refund Failed',
            description: err?.reason || err?.message || 'Smart contract rejected claim.',
          });
          return false;
        }
      }

      // Demo refund execution
      await new Promise((res) => setTimeout(res, 1200));

      const position = userPositions.find((p) => p.jarId === jarId);
      if (position) {
        const refundVal = parseFloat(position.refundableAmount.replace(/[^\d.]/g, ''));
        const currentBal = parseFloat(localStorage.getItem('sme_demo_balance') || '125000');
        localStorage.setItem('sme_demo_balance', (currentBal + refundVal).toFixed(2));
      }

      // Mark claimed
      localStorage.setItem(`claimed_${jarId}_${address}`, 'true');

      // Clear from user holdings
      const holdings = JSON.parse(localStorage.getItem(`demo_holdings_${address}`) || '{}');
      delete holdings[jarId];
      localStorage.setItem(`demo_holdings_${address}`, JSON.stringify(holdings));

      updateToast(toastId, {
        type: 'success',
        title: 'Refund Successfully Claimed!',
        description: `100% principal refunded back to your Bridgekey wallet address.`,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });

      triggerConfetti();
      await refreshBalance();
      await refreshUserPositions();
      return true;
    },
    [isConnected, address, jars, isDemoMode, signer, userPositions, showPending, updateToast, showError, refreshPoolData, refreshBalance, refreshUserPositions]
  );

  // Claim Returns / Gains
  const claimReturns = useCallback(
    async (jarId: string): Promise<boolean> => {
      if (!isConnected || !address) {
        showError('Connect Wallet', 'Please connect your Bridgekey wallet to claim listing gains.');
        return false;
      }

      const targetJar = jars.find((j) => j.id === jarId);
      if (!targetJar) return false;

      const toastId = showPending(
        'Withdrawing IPO Returns...',
        `Processing proportional listing payout from ${targetJar.companyName} jar...`
      );

      if (targetJar.isLiveContract && !isDemoMode && signer) {
        try {
          const receipt = await contractService.claimReturns(signer);
          updateToast(toastId, {
            type: 'success',
            title: 'Funds Withdrawn Successfully!',
            description: `Listing proceeds have been transferred to your Bridgekey wallet.`,
            txHash: receipt?.hash,
          });
          triggerConfetti();
          await refreshPoolData();
          await refreshBalance();
          await refreshUserPositions();
          return true;
        } catch (err: any) {
          updateToast(toastId, {
            type: 'error',
            title: 'Claim Failed',
            description: err?.reason || err?.message || 'Smart contract rejected claim.',
          });
          return false;
        }
      }

      // Demo returns payout
      await new Promise((res) => setTimeout(res, 1200));

      const position = userPositions.find((p) => p.jarId === jarId);
      if (position) {
        const claimVal = parseFloat(position.claimableReturns.replace(/[^\d.]/g, ''));
        const currentBal = parseFloat(localStorage.getItem('sme_demo_balance') || '125000');
        localStorage.setItem('sme_demo_balance', (currentBal + claimVal).toFixed(2));
      }

      // Mark claimed
      localStorage.setItem(`claimed_${jarId}_${address}`, 'true');

      // Clear from user holdings
      const holdings = JSON.parse(localStorage.getItem(`demo_holdings_${address}`) || '{}');
      delete holdings[jarId];
      localStorage.setItem(`demo_holdings_${address}`, JSON.stringify(holdings));

      updateToast(toastId, {
        type: 'success',
        title: 'Listing Gains Withdrawn!',
        description: `Your proportional share of the IPO outcome has been credited to your wallet.`,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });

      triggerConfetti();
      await refreshBalance();
      await refreshUserPositions();
      return true;
    },
    [isConnected, address, jars, isDemoMode, signer, userPositions, showPending, updateToast, showError, refreshPoolData, refreshBalance, refreshUserPositions]
  );

  // Manager: Execute Lot Purchase
  const executeLotPurchase = useCallback(
    async (jarId: string): Promise<boolean> => {
      const targetJar = jars.find((j) => j.id === jarId);
      if (!targetJar) return false;

      const toastId = showPending(
        'Executing SME Lot Purchase...',
        `Triggering executeLotPurchase() for ${targetJar.companyName}...`
      );

      if (targetJar.isLiveContract && !isDemoMode && signer) {
        try {
          const receipt = await contractService.executeLotPurchase(signer);
          updateToast(toastId, {
            type: 'success',
            title: 'Lot Purchase Executed!',
            description: `SME IPO lot successfully bid on-chain via Bridgekey institutional gateway.`,
            txHash: receipt?.hash,
          });
          await refreshPoolData();
          return true;
        } catch (err: any) {
          updateToast(toastId, {
            type: 'error',
            title: 'Lot Purchase Failed',
            description: err?.reason || err?.message || 'Manager authorization required or target not reached.',
          });
          return false;
        }
      }

      // Demo execution
      await new Promise((res) => setTimeout(res, 1200));

      setJars((prev) =>
        prev.map((j) => {
          if (j.id === jarId) {
            return {
              ...j,
              lotPurchased: true,
              status: 'ALLOTTED',
            };
          }
          return j;
        })
      );

      updateToast(toastId, {
        type: 'success',
        title: 'Lot Purchase Executed!',
        description: `IPO lot for ${targetJar.companyName} acquired. Jar state updated to Allotted.`,
      });

      await refreshUserPositions();
      return true;
    },
    [jars, isDemoMode, signer, showPending, updateToast, refreshPoolData, refreshUserPositions]
  );

  // Manager: Distribute Listing Gains
  const distributeGains = useCallback(
    async (jarId: string, gainsAmountMst: number): Promise<boolean> => {
      const targetJar = jars.find((j) => j.id === jarId);
      if (!targetJar) return false;

      const gainsWei = ethers.parseEther(gainsAmountMst.toString());
      const toastId = showPending(
        'Distributing Listing Gains...',
        `Depositing ${formatIntegerWithCommas(gainsAmountMst)} MST profit to jar contract...`
      );

      if (targetJar.isLiveContract && !isDemoMode && signer) {
        try {
          const receipt = await contractService.distributeListingGains(signer, gainsWei);
          updateToast(toastId, {
            type: 'success',
            title: 'Gains Distributed!',
            description: `${formatIntegerWithCommas(gainsAmountMst)} MST profit distributed to all fraction holders.`,
            txHash: receipt?.hash,
          });
          await refreshPoolData();
          await refreshUserPositions();
          return true;
        } catch (err: any) {
          updateToast(toastId, {
            type: 'error',
            title: 'Distribution Failed',
            description: err?.reason || err?.message || 'Smart contract error.',
          });
          return false;
        }
      }

      // Demo distribution
      await new Promise((res) => setTimeout(res, 1200));

      setJars((prev) =>
        prev.map((j) => {
          if (j.id === jarId) {
            return {
              ...j,
              returnsDistributed: true,
              totalReturns: gainsWei,
              totalReturnsFormatted: `${formatIntegerWithCommas(gainsAmountMst)} MST`,
              status: 'ALLOTTED',
            };
          }
          return j;
        })
      );

      updateToast(toastId, {
        type: 'success',
        title: 'Gains Distributed!',
        description: `${formatIntegerWithCommas(gainsAmountMst)} MST deposited into jar. Fraction holders can now withdraw!`,
      });

      await refreshUserPositions();
      return true;
    },
    [jars, isDemoMode, signer, showPending, updateToast, refreshPoolData, refreshUserPositions]
  );

  return (
    <IpoContext.Provider
      value={{
        jars,
        userPositions,
        isLoading,
        selectedJar,
        setSelectedJar,
        investInJar,
        claimRefund,
        claimReturns,
        executeLotPurchase,
        distributeGains,
        refreshPoolData,
        filterSector,
        setFilterSector,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </IpoContext.Provider>
  );
};

export function useIpo() {
  const context = useContext(IpoContext);
  if (!context) {
    throw new Error('useIpo must be used within an IpoProvider');
  }
  return context;
}
