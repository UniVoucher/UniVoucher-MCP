# Fee Structure

UniVoucher implements a simple, transparent fee model with support for partner fees. This page explains how fees work and how they're calculated.

## Fee Overview

UniVoucher implements two types of fees:

### Creation Fees
- The fee is calculated as a percentage of the card amount
- The current fee percentage is **1%** (100 basis points)
- Fees are paid in the same token as the card
- Fees are collected at the time of card creation
- No fees are charged for card redemption or cancellation

### Partner Fees
- Partners can earn **1%** of the card amount when facilitating redemptions
- Partner fees are deducted from the card amount (not added on top)
- Partner fees are optional and only apply when a partner address is provided
- Partners receive their fee directly during the redemption transaction

## Fee Calculation

### Creation Fee Calculation

Creation fees are calculated using the following formula:

```
Creation Fee = Card Amount × Fee Percentage
```

Where:

- Fee Percentage = 1% (0.01)

For example:

- A card with 100 USDC would incur a creation fee of 1 USDC
- A card with 1 ETH would incur a creation fee of 0.01 ETH

### Partner Fee Calculation

Partner fees are calculated and deducted during redemption:

```
Partner Fee = Card Amount × 1%
Recipient Amount = Card Amount - Partner Fee
```

For example, when redeeming a 100 USDC card through a partner:

- Partner receives: 1 USDC (1% partner fee)
- Recipient receives: 99 USDC (remaining amount)

**Important**: Partner fees are deducted from the card amount, not added to the total cost.

The contract uses a more precise calculation with basis points:

```solidity
function calculateFee(uint256 amount) public view returns (uint256) {
    return amount.mul(feePercentage).div(10000);
}
```

Where:

- `feePercentage` = 100 (basis points, equal to 1%)
- 10000 basis points = 100%

## Total Transaction Value

When creating a card, the total transaction value is:

```
Total Value = Card Amount + Fee
```

For example:

- Creating a card with 100 USDC requires 101 USDC total
- Creating a card with 1 ETH requires 1.01 ETH total

For bulk card creation, this is multiplied by the number of cards:

```
Total Value = (Card Amount + Fee) × Number of Cards
```

## Fee Collection and Management

### Fee Collection

Fees are collected by the smart contract during card creation:

1. For native tokens (ETH, BNB, AVAX, etc.):

     - The fee is added to the transaction value
     - The contract separates the fee from the card amount

2. For ERC-20 tokens:

    - The fee is added to the token approval amount
    - The contract transfers both the card amount and fee

### Fee Accounting

The contract maintains separate accounting for fees collected in different tokens:

- Native token fees are stored in the contract's balance
- ERC-20 token fees are tracked by token address
- Fee accounting is separate from card funds

### Fee Retrieval

Fees can only be withdrawn by the contract owner:

- The contract includes a function to withdraw accumulated fees
- Fees can be withdrawn per token type
- Withdrawal events are publicly visible on the blockchain

## Fee Display

The UniVoucher interface clearly displays fee information:

1. **During Card Creation**:

    - The fee is shown alongside the card amount
    - The total transaction value is displayed
    - For bulk cards, both per-card and total fees are shown

2. **In Card Details**:

    - The "Fee Paid" is displayed in the advanced card details
    - This is shown for transparency and record-keeping

## Fee Considerations by Network

While the fee percentage is the same across all networks, different networks have different gas costs:

- **High-gas networks** (like Ethereum mainnet):The transaction gas cost may be higher than the fee for small card amounts

- **Low-gas networks** (like Polygon, Arbitrum, etc.): Gas costs are typically much lower, making the fee more significant in proportion

## Transparent Fee Policy

UniVoucher maintains a transparent fee policy:

- **Creation Fee**: 1% of card amount (paid by card creator)
- **Partner Fee**: 1% of card amount (deducted during redemption, if partner is involved)
- **No Hidden Charges**: All fees are clearly disclosed
- **No Redemption Fees**: Recipients don't pay to redeem cards
- **No Cancellation Fees**: No cost to cancel unredeemed cards
- **No Maintenance Fees**: No ongoing costs for active cards

The only cost beyond the creation fee is the blockchain network gas fee, which is standard for all blockchain transactions. Partner fees (when applicable) are deducted from the card amount and don't create additional costs for the card creator or recipient.

## Future Fee Adjustments

The fee percentage is managed through the smart contract:

- The current fee is 1%
- Fee changes would be transparent and announced to the community
- The contract allows fee adjustments up to a maximum hard cap of 2%
- The contract emits an event whenever the fee percentage changes

```solidity
event FeePercentageUpdated(
    uint256 oldFeePercentage,
    uint256 newFeePercentage,
    uint256 timestamp
);
```
```solidity
function setFeePercentage(uint256 newFeePercentage) external onlyOwner {
   require(newFeePercentage <= 200, "Fee cannot exceed 2%");
   uint256 oldFeePercentage = feePercentage;
   feePercentage = newFeePercentage;
   emit FeePercentageUpdated(oldFeePercentage, newFeePercentage, block.timestamp);
}
```    