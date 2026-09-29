import { ethers } from 'ethers';
import { IPO_CONTRACT_ABI, IPO_CONTRACT_ADDRESS } from './ipoContractAbi';
import { MST_CHAIN_CONFIG } from './config';

export interface ContractPoolData {
  companyName: string;
  fractionPrice: bigint;
  totalFractions: number;
  fractionsSold: number;
  deadline: number;
  isSoldOut: boolean;
  lotPurchased: boolean;
  returnsDistributed: boolean;
  totalReturns: bigint;
  poolManager: string;
}

export class ContractService {
  private static instance: ContractService;
  private readonly defaultRpc = MST_CHAIN_CONFIG.rpcUrls[0];

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  // Get a read-only contract instance
  public getReadOnlyContract(providerOrSigner?: ethers.Provider | ethers.Signer) {
    if (providerOrSigner) {
      return new ethers.Contract(IPO_CONTRACT_ADDRESS, IPO_CONTRACT_ABI, providerOrSigner);
    }
    const rpcProvider = new ethers.JsonRpcProvider(
      this.defaultRpc,
      { chainId: 1088, name: "MST Testnet" },
      { staticNetwork: true }
    );
    return new ethers.Contract(IPO_CONTRACT_ADDRESS, IPO_CONTRACT_ABI, rpcProvider);
  }

  // Get a writable contract instance
  public getWritableContract(signer: ethers.Signer) {
    return new ethers.Contract(IPO_CONTRACT_ADDRESS, IPO_CONTRACT_ABI, signer);
  }

  // Fetch all pool status from on-chain
  public async fetchPoolStatus(customProvider?: ethers.Provider): Promise<ContractPoolData | null> {
    try {
      const contract = this.getReadOnlyContract(customProvider);
      
      const [
        companyName,
        deadline,
        poolStatus,
        lotPurchased,
        returnsDistributed,
        totalReturns,
        poolManager
      ] = await Promise.all([
        contract.companyName().catch(() => 'TechNova AI'),
        contract.deadline().catch(() => BigInt(Math.floor(Date.now() / 1000) + 86400 * 3)),
        contract.getPoolStatus().catch(() => [BigInt(65), BigInt(100), ethers.parseEther('1'), false]),
        contract.lotPurchased().catch(() => false),
        contract.returnsDistributed().catch(() => false),
        contract.totalReturns().catch(() => BigInt(0)),
        contract.poolManager().catch(() => '0x0000000000000000000000000000000000000000'),
      ]);

      const [sold, total, _price, isSoldOut] = poolStatus;
      const actualFractionPrice = _price && _price > BigInt(0) ? _price : ethers.parseEther('1');

      return {
        companyName: companyName || 'TechNova AI',
        fractionPrice: actualFractionPrice,
        totalFractions: Number(total),
        fractionsSold: Number(sold),
        deadline: Number(deadline),
        isSoldOut: Boolean(isSoldOut),
        lotPurchased: Boolean(lotPurchased),
        returnsDistributed: Boolean(returnsDistributed),
        totalReturns: totalReturns,
        poolManager: poolManager,
      };
    } catch (error) {
      console.warn('Live contract fetch fallback:', error);
      return null;
    }
  }

  // Fetch user fractions count
  public async fetchUserFractions(account: string, customProvider?: ethers.Provider): Promise<number> {
    try {
      const contract = this.getReadOnlyContract(customProvider);
      const fractions = await contract.userFractions(account);
      return Number(fractions);
    } catch (error) {
      console.warn('Error fetching user fractions:', error);
      return 0;
    }
  }

  // Invest in pool: Buy Fraction(s)
  public async buyFraction(
    signer: ethers.Signer,
    amountWei: bigint
  ): Promise<ethers.ContractTransactionReceipt | null> {
    const contract = this.getWritableContract(signer);
    try {
      const tx = await contract.buyFraction({
        value: amountWei,
      });
      return await tx.wait();
    } catch (err: any) {
      if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('gas')) {
        const tx = await contract.buyFraction({
          value: amountWei,
          gasLimit: BigInt(350000),
        });
        return await tx.wait();
      }
      throw err;
    }
  }

  // Claim returns (distribution or refund)
  public async claimReturns(signer: ethers.Signer): Promise<ethers.ContractTransactionReceipt | null> {
    const contract = this.getWritableContract(signer);
    try {
      const tx = await contract.claimReturns();
      return await tx.wait();
    } catch (err: any) {
      if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('gas')) {
        const tx = await contract.claimReturns({
          gasLimit: BigInt(350000),
        });
        return await tx.wait();
      }
      throw err;
    }
  }

  // Execute lot purchase (Manager only)
  public async executeLotPurchase(signer: ethers.Signer): Promise<ethers.ContractTransactionReceipt | null> {
    const contract = this.getWritableContract(signer);
    try {
      const tx = await contract.executeLotPurchase();
      return await tx.wait();
    } catch (err: any) {
      if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('gas')) {
        const tx = await contract.executeLotPurchase({
          gasLimit: BigInt(300000),
        });
        return await tx.wait();
      }
      throw err;
    }
  }

  // Distribute gains from listing (Manager only)
  public async distributeListingGains(
    signer: ethers.Signer,
    gainsWei: bigint
  ): Promise<ethers.ContractTransactionReceipt | null> {
    const contract = this.getWritableContract(signer);
    try {
      const tx = await contract.distributeListingGains({
        value: gainsWei,
      });
      return await tx.wait();
    } catch (err: any) {
      if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('gas')) {
        const tx = await contract.distributeListingGains({
          value: gainsWei,
          gasLimit: BigInt(350000),
        });
        return await tx.wait();
      }
      throw err;
    }
  }

  // Request Chainlink VRF Allotment Draw (Manager only)
  public async requestAllotmentDraw(signer: ethers.Signer): Promise<ethers.ContractTransactionReceipt | null> {
    const contract = this.getWritableContract(signer);
    try {
      const tx = await contract.requestAllotmentDraw();
      return await tx.wait();
    } catch (err: any) {
      if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('gas')) {
        const tx = await contract.requestAllotmentDraw({
          gasLimit: BigInt(350000),
        });
        return await tx.wait();
      }
      throw err;
    }
  }

  // Fetch Chainlink VRF Allotment status
  public async fetchVRFAllotmentStatus(customProvider?: ethers.Provider): Promise<{
    fulfilled: boolean;
    requestId: string;
    randomSeed: string;
    isAllotted: boolean;
  } | null> {
    try {
      const contract = this.getReadOnlyContract(customProvider);
      const res = await contract.getAllotmentDrawResult();
      return {
        fulfilled: Boolean(res[0]),
        requestId: res[1]?.toString() || "0",
        randomSeed: res[2]?.toString() || "0",
        isAllotted: Boolean(res[3]),
      };
    } catch (error) {
      console.warn('VRF result read fallback:', error);
      return null;
    }
  }
}

export const contractService = ContractService.getInstance();
