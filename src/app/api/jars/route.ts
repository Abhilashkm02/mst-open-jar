import { NextResponse } from "next/server";
import { INITIAL_JARS } from "@/lib/mockData";
import { contractService } from "@/contracts/contractService";
import { CONTRACT_ADDRESS } from "@/contracts/config";

export async function GET() {
  try {
    // Attempt to query on-chain status from live MST testnet contract
    const onChainData = await contractService.fetchPoolStatus().catch(() => null);

    const jars = INITIAL_JARS.map(jar => {
      // If this jar is the live deployed smart contract
      if (jar.contractAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && onChainData) {
        const sold = onChainData.fractionsSold;
        const total = onChainData.totalFractions;
        const percent = Math.min(100, Math.round((sold / total) * 100));

        let status = jar.status;
        let statusLabel = jar.statusLabel;

        if (onChainData.returnsDistributed) {
          status = "ALLOTTED";
          statusLabel = "Bid Successful";
        } else if (onChainData.lotPurchased || onChainData.isSoldOut || percent >= 100) {
          status = "LOCKED";
          statusLabel = "Target Reached";
        }

        return {
          ...jar,
          currentMst: sold * 1, // 1 MST per fraction for testing
          fundedPercent: percent,
          status,
          statusLabel,
          targetMst: total * 1,
        };
      }
      return jar;
    });

    return NextResponse.json({
      success: true,
      jars,
      liveContract: {
        address: CONTRACT_ADDRESS,
        network: "MST Testnet",
        chainId: 1088,
        onChainData,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      jars: INITIAL_JARS,
      liveContract: {
        address: CONTRACT_ADDRESS,
        network: "MST Testnet",
        chainId: 1088,
        onChainData: null,
      },
    });
  }
}
