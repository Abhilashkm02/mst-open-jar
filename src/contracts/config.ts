export const MST_CHAIN_CONFIG = {
  chainId: 1088,
  chainIdHex: "0x440",
  chainName: "MST Testnet",
  nativeCurrency: {
    name: "MST Token",
    symbol: "MST",
    decimals: 18,
  },
  rpcUrls: [
    "https://rpc.mstchain.io",
    "http://127.0.0.1:8545"
  ],
  blockExplorerUrls: [
    "https://scan.mstchain.io"
  ],
};

export const CONTRACT_ADDRESS = "0x0f8a635256187a60C711EEd4404adc5432d409D9";

export const DEFAULT_DEMO_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const CHAINLINK_VRF_CONFIG = {
  coordinatorAddress: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
  keyHash: "0x8af398995b04c28e9951ced97dcce580e0477814577158b8e449a47f329e4e29",
  subscriptionId: "408",
  callbackGasLimit: 350000,
  requestConfirmations: 3,
  numWords: 1,
  oracleNetwork: "Chainlink Decentralized Oracle Network (DON)",
};
