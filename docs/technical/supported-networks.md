# Supported Networks

UniVoucher is deployed on multiple EVM-compatible blockchain networks, allowing you to create and redeem tangible gift cards across a wide range of ecosystems. This page provides details about each supported network.

!!! note
    Each network has a unique chain prefix used in card ID generation. For more technical details about how these prefixes are used, see the [Card ID Structure](./card-id-format.md#card-id-structure) documentation.

!!! info "Universal Contract Address"
    UniVoucher uses the same contract address across all supported networks: **0x51553818203e38ce0E78e4dA05C07ac779ec5b58**

## Overview of Supported Networks

| Network | Chain Prefix | Chain ID | Native Token | Explorer | Verified Contract |
|---------|-------------|----------|--------------|----------|-------------------|
| Ethereum | 01 | 1 | ETH | [Etherscan](https://etherscan.io) | [View Code](https://etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Base | 02 | 8453 | ETH | [BaseScan](https://basescan.org) | [View Code](https://basescan.org/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| BNB Chain | 03 | 56 | BNB | [BscScan](https://bscscan.com) | [View Code](https://bscscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Polygon | 04 | 137 | POL | [PolygonScan](https://polygonscan.com) | [View Code](https://polygonscan.com/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Arbitrum | 05 | 42161 | ETH | [Arbiscan](https://arbiscan.io) | [View Code](https://arbiscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Optimism | 06 | 10 | ETH | [Optimistic Etherscan](https://optimistic.etherscan.io) | [View Code](https://optimistic.etherscan.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |
| Avalanche | 07 | 43114 | AVAX | [Snowtrace](https://snowtrace.io) | [View Code](https://snowtrace.io/address/0x51553818203e38ce0E78e4dA05C07ac779ec5b58#code) |

!!! info "Contract Verification"
    All UniVoucher smart contracts are verified on their respective blockchain explorers. You can view the source code, ABI, and contract details by clicking the "View Code" links in the table above.

## Network Details

### Ethereum (Mainnet)

- **Chain Prefix**: 01
- **Chain ID**: 1
- **Native Token**: ETH (Ethereum)
- **Explorer**: [Etherscan](https://etherscan.io)
- **Deployment Block**: 22714895

Ethereum is the original smart contract platform and offers the highest security and decentralization. It typically has higher gas fees than other networks.

### Base

- **Chain Prefix**: 02
- **Chain ID**: 8453
- **Native Token**: ETH (Ethereum on Base)
- **Explorer**: [BaseScan](https://basescan.org)
- **Deployment Block**: 31629302

Base is an Ethereum L2 scaling solution built by Coinbase, offering lower fees while maintaining Ethereum security.

### BNB Chain

- **Chain Prefix**: 03
- **Chain ID**: 56
- **Native Token**: BNB
- **Explorer**: [BscScan](https://bscscan.com)
- **Deployment Block**: 51538912

BNB Chain (formerly Binance Smart Chain) offers high throughput and low fees, making it suitable for smaller-value transactions.

### Polygon

- **Chain Prefix**: 04
- **Chain ID**: 137
- **Native Token**: POL (formerly MATIC)
- **Explorer**: [PolygonScan](https://polygonscan.com)
- **Deployment Block**: 72827473

Polygon is a popular scaling solution with a large ecosystem of dApps and relatively low transaction fees.

### Arbitrum

- **Chain Prefix**: 05
- **Chain ID**: 42161
- **Native Token**: ETH (Ethereum on Arbitrum)
- **Explorer**: [Arbiscan](https://arbiscan.io)
- **Deployment Block**: 347855002

Arbitrum is an Ethereum L2 scaling solution using Optimistic Rollups to provide lower fees and higher throughput.

### Optimism

- **Chain Prefix**: 06
- **Chain ID**: 10
- **Native Token**: ETH (Ethereum on Optimism)
- **Explorer**: [Optimistic Etherscan](https://optimistic.etherscan.io)
- **Deployment Block**: 137227100

Optimism is another Ethereum L2 scaling solution using Optimistic Rollups, offering improved scalability and reduced fees.

### Avalanche

- **Chain Prefix**: 07
- **Chain ID**: 43114
- **Native Token**: AVAX
- **Explorer**: [Snowtrace](https://snowtrace.io)
- **Deployment Block**: 63937777

Avalanche offers high throughput and quick finality with its own native token AVAX.

## Network Selection

When creating a gift card, you'll need to select which network to use. Consider these factors:

1. **Gas Fees**: L2 networks and alternative L1s typically have lower transaction fees
2. **Recipient Preference**: Choose a network the recipient is familiar with
3. **Token Availability**: If using an ERC-20 token, ensure it exists on your chosen network
4. **Network Congestion**: Some networks may be faster during high-activity periods

## Switching Networks

UniVoucher automatically prompts you to switch networks when necessary:

- When creating a card, you need to be connected to the desired network
- When redeeming a card, you need to be connected to the network where the card was created
- When viewing card details, no specific network connection is required
- When managing your cards, you'll be prompted to switch networks if canceling cards

To switch networks manually:

1. Click on the network indicator in the top right corner
2. Select the desired network from the dropdown
3. Confirm the network switch in your wallet if needed

!!! warning "Important cross-chain limitations"
    - Cards created on one network cannot be redeemed on another
    - You cannot use a token from one network to create a card on another
    - Each network's cards are independent and stored on that specific blockchain
    - Card IDs include network identification to prevent confusion