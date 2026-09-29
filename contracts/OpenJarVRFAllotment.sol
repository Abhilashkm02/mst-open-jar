// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OpenJarVRFAllotment
 * @notice Decentralized, Non-Custodial SME IPO Fractionalizer Pool with Chainlink VRF
 *         Guarantees tamper-proof, verifiable, and unbiased IPO allotment draws using
 *         Chainlink Verifiable Random Function (VRF v2).
 */

interface VRFCoordinatorV2Interface {
    function getRequestConfig()
        external
        view
        returns (
            uint16,
            uint32,
            bytes32[] memory
        );

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);

    function createSubscription() external returns (uint64 subId);

    function getSubscription(uint64 subId)
        external
        view
        returns (
            uint96 balance,
            uint64 reqCount,
            address owner,
            address[] memory consumers
        );
}

abstract contract VRFConsumerBaseV2 {
    error OnlyCoordinatorCanFulfill(address have, address want);
    address private immutable vrfCoordinator;

    constructor(address _vrfCoordinator) {
        vrfCoordinator = _vrfCoordinator;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        if (msg.sender != vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
        }
        fulfillRandomWords(requestId, randomWords);
    }
}

contract OpenJarVRFAllotment is VRFConsumerBaseV2 {
    // --- IPO Pool Metadata ---
    string public companyName;
    uint256 public fractionPrice;
    uint256 public totalFractions;
    uint256 public fractionsSold;
    uint256 public deadline;
    address public poolManager;

    // --- Syndicate Lifecycle Flags ---
    bool public lotPurchased;
    bool public returnsDistributed;
    uint256 public totalReturns;

    // --- Chainlink VRF Configuration ---
    VRFCoordinatorV2Interface public immutable COORDINATOR;
    bytes32 public immutable keyHash;
    uint64 public immutable s_subscriptionId;
    uint32 public callbackGasLimit = 350000;
    uint16 public requestConfirmations = 3;
    uint32 public constant NUM_WORDS = 1;

    // --- Decentralized Allotment Draw State ---
    uint256 public vrfRequestId;
    uint256 public vrfRandomSeed;
    bool public vrfFulfilled;
    bool public isAllottedVRF;
    uint256 public vrfDrawTimestamp;

    // --- Investor Accounting ---
    mapping(address => uint256) public userFractions;
    address[] public fractionHolders;

    // --- Events ---
    event FractionPurchased(address indexed buyer, uint256 fractionNumber);
    event LotExecuted(uint256 totalAmount);
    event GainsDistributed(uint256 totalProfit);
    event ReturnsClaimed(address indexed investor, uint256 amount);
    event AllotmentDrawRequested(uint256 indexed requestId, uint256 timestamp);
    event AllotmentDrawFulfilled(uint256 indexed requestId, uint256 randomSeed, bool isAllotted);

    modifier onlyManager() {
        require(msg.sender == poolManager, "OpenJar: Only pool manager can call");
        _;
    }

    constructor(
        string memory _companyName,
        uint256 _fractionPrice,
        uint256 _totalFractions,
        uint256 _durationMinutes,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        companyName = _companyName;
        fractionPrice = _fractionPrice;
        totalFractions = _totalFractions;
        deadline = block.timestamp + (_durationMinutes * 1 minutes);
        poolManager = msg.sender;

        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        s_subscriptionId = _subscriptionId;
    }

    /**
     * @notice Purchase fraction units in the IPO syndicate
     */
    function buyFraction() external payable {
        require(block.timestamp <= deadline, "OpenJar: Syndicate closed");
        require(!lotPurchased, "OpenJar: Lot already purchased");
        require(msg.value >= fractionPrice, "OpenJar: Insufficient value for fraction");

        uint256 fractionsToBuy = msg.value / fractionPrice;
        require(fractionsSold + fractionsToBuy <= totalFractions, "OpenJar: Exceeds target fraction count");

        if (userFractions[msg.sender] == 0) {
            fractionHolders.push(msg.sender);
        }

        userFractions[msg.sender] += fractionsToBuy;
        fractionsSold += fractionsToBuy;

        for (uint256 i = 0; i < fractionsToBuy; i++) {
            emit FractionPurchased(msg.sender, fractionsSold - fractionsToBuy + i + 1);
        }
    }

    /**
     * @notice Step 1: Manager locks the pool and executes SME exchange lot application
     */
    function executeLotPurchase() external onlyManager {
        require(!lotPurchased, "OpenJar: Lot already executed");
        require(fractionsSold > 0, "OpenJar: No fractions pooled");
        lotPurchased = true;
        emit LotExecuted(address(this).balance);
    }

    /**
     * @notice Step 2: Request decentralized, provably unbiased allotment draw via Chainlink VRF v2
     * @dev Requests a cryptographically verified 256-bit random word from Chainlink DON
     */
    function requestAllotmentDraw() external onlyManager returns (uint256 requestId) {
        require(lotPurchased, "OpenJar: Execute lot purchase first");
        require(!vrfFulfilled, "OpenJar: VRF draw already fulfilled");

        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            NUM_WORDS
        );

        vrfRequestId = requestId;
        vrfDrawTimestamp = block.timestamp;
        emit AllotmentDrawRequested(requestId, block.timestamp);
    }

    /**
     * @notice Callback invoked exclusively by Chainlink VRF Coordinator upon generating cryptographic proof
     * @param requestId The ID assigned during requestRandomWords
     * @param randomWords The array of verifiable random values returned by Chainlink
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(requestId == vrfRequestId, "OpenJar: Unexpected request ID");
        require(!vrfFulfilled, "OpenJar: Already fulfilled");

        vrfRandomSeed = randomWords[0];
        vrfFulfilled = true;

        // Provably unbiased allotment calculation:
        // In SME IPO oversubscribed quota, winning lot draw is determined by the VRF entropy modulo 100.
        // E.g. A 60% exchange subscription allotment quota succeeds if (seed % 100) < 60
        uint256 drawResult = vrfRandomSeed % 100;
        isAllottedVRF = (drawResult < 60);

        emit AllotmentDrawFulfilled(requestId, vrfRandomSeed, isAllottedVRF);
    }

    /**
     * @notice Step 3: Manager deposits listing day profits into contract if syndicate was allotted
     */
    function distributeListingGains() external payable onlyManager {
        require(lotPurchased, "OpenJar: Lot not purchased");
        require(vrfFulfilled && isAllottedVRF, "OpenJar: Cannot distribute on un-allotted syndicate");
        require(msg.value > 0, "OpenJar: Zero listing gains");

        totalReturns = address(this).balance;
        returnsDistributed = true;

        emit GainsDistributed(msg.value);
    }

    /**
     * @notice Fraction holders claim their payout (profit share if allotted, or 100% refund if draw missed)
     */
    function claimReturns() external {
        uint256 fractions = userFractions[msg.sender];
        require(fractions > 0, "OpenJar: No fractions owned");

        uint256 payout = 0;

        if (returnsDistributed && isAllottedVRF) {
            // Syndicate was allotted and liquidated on listing day: pay principal + proportional profit
            payout = (fractions * totalReturns) / totalFractions;
        } else if (vrfFulfilled && !isAllottedVRF) {
            // Decentralized allotment draw was missed: 100% escrow principal refund with zero fees
            payout = fractions * fractionPrice;
        } else if (block.timestamp > deadline && !lotPurchased) {
            // Funding expired without reaching lot purchase: refund principal
            payout = fractions * fractionPrice;
        } else {
            revert("OpenJar: Payout not ready or conditions not met");
        }

        userFractions[msg.sender] = 0;
        require(address(this).balance >= payout, "OpenJar: Insufficient contract balance");

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "OpenJar: Native MST transfer failed");

        emit ReturnsClaimed(msg.sender, payout);
    }

    /**
     * @notice View the full Chainlink VRF allotment draw verification data
     */
    function getAllotmentDrawResult()
        external
        view
        returns (
            bool fulfilled,
            uint256 requestId,
            uint256 randomSeed,
            bool isAllotted,
            uint256 timestamp
        )
    {
        return (vrfFulfilled, vrfRequestId, vrfRandomSeed, isAllottedVRF, vrfDrawTimestamp);
    }

    /**
     * @notice View general pool metrics
     */
    function getPoolStatus()
        external
        view
        returns (
            uint256 _sold,
            uint256 _total,
            uint256 _price,
            bool _isSoldOut
        )
    {
        return (fractionsSold, totalFractions, fractionPrice, fractionsSold >= totalFractions);
    }

    receive() external payable {}
}
