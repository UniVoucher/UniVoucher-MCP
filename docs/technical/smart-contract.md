# Smart Contract Details

UniVoucher is powered by a carefully designed smart contract that handles tangible gift card creation, redemption, and management. This page provides technical details about the contract's functionality and implementation.

## Contract Overview

The UniVoucher contract is deployed on multiple EVM-compatible networks with the same functionality. It manages the entire lifecycle of tangible gift cards, from creation to redemption or cancellation.

!!! info "Universal Contract Address"
    UniVoucher uses the same contract address across all supported networks: **0x51553818203e38ce0E78e4dA05C07ac779ec5b58**

### Contract Addresses

| Network | Chain Prefix | Chain ID | Deployment Block | Verified Contract |
|---------|-------------|----------|------------------|-------------------|
| Ethereum | 01 | 1 | 22714895 | [View Code](https://etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Base | 02 | 8453 | 31629302 | [View Code](https://basescan.org/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| BNB Chain | 03 | 56 | 51538912 | [View Code](https://bscscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Polygon | 04 | 137 | 72827473 | [View Code](https://polygonscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Arbitrum | 05 | 42161 | 347855002 | [View Code](https://arbiscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Optimism | 06 | 10 | 137227100 | [View Code](https://optimistic.etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Avalanche | 07 | 43114 | 63937777 | [View Code](https://snowtrace.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |

## Core Contract Functions

### Card Creation Functions

```solidity
function depositETH(
    address slotId, 
    uint256 amount, 
    string memory message, 
    string memory encryptedPrivateKey
) external payable
```
Creates a card with the native token (ETH, BNB, AVAX, etc.).

```solidity
function depositERC20(
    address slotId, 
    address tokenAddress, 
    uint256 amount, 
    string memory message, 
    string memory encryptedPrivateKey
) external
```
Creates a card with an ERC-20 token.

```solidity
function bulkDepositETH(
    address[] calldata slotIds, 
    uint256[] calldata amounts, 
    string[] calldata messages, 
    string[] calldata encryptedPrivateKeys
) external payable
```
Creates multiple native token cards in a single transaction.

```solidity
function bulkDepositERC20(
    address[] calldata slotIds, 
    address tokenAddress, 
    uint256[] calldata amounts, 
    string[] calldata messages, 
    string[] calldata encryptedPrivateKeys
) external
```
Creates multiple ERC-20 token cards in a single transaction.

### Card Redemption Function

```solidity
function redeemCard(
    string memory cardId, 
    address payable to, 
    bytes memory signature,
    address payable partner
) external
```
Redeems a card by verifying the signature and transferring funds to the specified address. If a partner address is provided, 1% of the card amount is sent to the partner as a fee.

### Card Management Functions

```solidity
function cancelCard(string memory cardId) external
```
Allows the creator to cancel an unredeemed card and reclaim funds.

```solidity
function bulkCancelCards(string[] memory cardIds) external
```
Cancels multiple cards in a single transaction.

```solidity
function getCardData(string memory cardId) external view returns (
    bool active, 
    address tokenAddress, 
    uint256 tokenAmount, 
    uint256 feePaid, 
    address creator, 
    string memory message, 
    string memory encryptedPrivateKey, 
    address slotId, 
    uint256 timestamp, 
    address redeemedBy, 
    address cancelledBy, 
    address partnerAddress,
    uint256 finalizedTimestamp
)
```
Retrieves comprehensive data about a card.

### Utility Functions

```solidity
function slotToCard(address slotId) external view returns (string)
```
Gets the card ID associated with a slot ID (public key).

```solidity
function isCardActive(string memory cardId) public view returns (bool)
```
Checks if a card is still active (not redeemed or cancelled).

```solidity
function calculateFee(uint256 amount) public view returns (uint256)
```
Calculates the fee for a given amount based on the current fee percentage.

```solidity
function feePercentage() public view returns (uint256)
```
Returns the current fee percentage in basis points (e.g., 100 = 1%).

## Contract Events

The contract emits the following events:

```solidity
event CardCreated(
    string cardId, 
    address indexed slotId, 
    address indexed creator, 
    address tokenAddress, 
    uint256 tokenAmount, 
    uint256 feePaid, 
    string message, 
    string encryptedPrivateKey, 
    uint256 timestamp
)
```
Emitted when a new card is created.

```solidity
event CardRedeemed(
    string cardId, 
    address indexed slotId, 
    address indexed to, 
    address tokenAddress, 
    uint256 amount, 
    address indexed partner,
    uint256 timestamp
)
```
Emitted when a card is redeemed.

```solidity
event CardCancelled(
    string cardId, 
    address indexed slotId, 
    address indexed creator, 
    address tokenAddress, 
    uint256 amount, 
    uint256 timestamp
)
```
Emitted when a card is cancelled.

```solidity
event FeePercentageUpdated(
    uint256 oldFeePercentage, 
    uint256 newFeePercentage, 
    uint256 timestamp
)
```
Emitted when the fee percentage is updated.

```solidity
event FeesWithdrawn(
    address indexed token, 
    address indexed recipient, 
    uint256 amount, 
    uint256 timestamp
)
```
Emitted when collected fees are withdrawn.

## Card Data Structure

Each card in the contract contains the following data:

- **Card ID**: Unique identifier generated with format version + chain prefix + slot ID
- **Slot ID**: The public key address used as the card's identifier
- **Active Status**: Whether the card can still be redeemed
- **Token Address**: The address of the token (address(0) for native tokens)
- **Token Amount**: The amount of tokens stored in the card
- **Fee Paid**: The fee amount collected during creation
- **Creator**: The address that created the card
- **Message**: An optional message stored with the card
- **Encrypted Private Key**: The encrypted private key that can be decrypted with the card secret
- **Timestamp**: When the card was created
- **Redeemed By**: Address that redeemed the card (if redeemed)
- **Cancelled By**: Address that cancelled the card (if cancelled)
- **Partner Address**: The partner address that received a fee during redemption (if any)
- **Finalized Timestamp**: When the card was redeemed or cancelled

## Security Mechanism

The contract uses a cryptographic security model:

1. Each card is associated with a public key (slot ID)
2. The corresponding private key is encrypted and stored on-chain
3. Only someone with the card secret can decrypt the private key
4. To redeem, the private key signs a message proving knowledge of the secret
5. The contract verifies this signature against the public key
6. This proves the redeemer knows the secret without revealing it

## Fee Collection

The contract collects fees during card creation and supports partner fees during redemption:

### Creation Fees
1. Fee is calculated as 1% of the card amount (100 basis points)
2. Fees are stored in the contract, segregated by token
3. Only the contract owner can withdraw accumulated fees
4. Fee percentage can be adjusted by the contract owner

### Partner Fees
1. Partners can receive 1% of the card amount when facilitating redemptions
2. Partner fee is deducted from the card amount
3. Partner fees are paid directly to the partner address during redemption
4. If no partner is specified, the full card amount goes to the recipient

## Abandonment Protection

The contract includes a mechanism to handle abandoned cards:

1. Cards unredeemed for 5 years are considered abandoned
2. Only after this period can the contract owner intervene
3. This prevents permanent fund loss while respecting user autonomy

## Contract Verification

All deployed contracts are verified on their respective block explorers. You can view the source code, ABI, and contract details at the following links:

### Verification Links

- **Ethereum (ID: 1)**: [https://etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **Base (ID: 8453)**: [https://basescan.org/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://basescan.org/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **BNB Chain (ID: 56)**: [https://bscscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://bscscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **Polygon (ID: 137)**: [https://polygonscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://polygonscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **Arbitrum (ID: 42161)**: [https://arbiscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://arbiscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **Optimism (ID: 10)**: [https://optimistic.etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://optimistic.etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)
- **Avalanche (ID: 43114)**: [https://snowtrace.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code](https://snowtrace.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code)

### What You Can Find

- **Source Code**: Complete Solidity source code for transparency
- **ABI**: Application Binary Interface for direct contract interaction
- **Compiler Details**: Solidity version and optimization settings used
- **Constructor Arguments**: Parameters used during deployment
- **Contract Bytecode**: Compiled contract code deployed on-chain
