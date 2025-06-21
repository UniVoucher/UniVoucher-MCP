# Card ID Format

UniVoucher uses a structured card ID format that encodes important information about each tangible gift card. This page explains the format and how to interpret card IDs.

## Card ID Structure

A UniVoucher card ID consists of three key components:

```
[Version][Chain Prefix][Card Number]
```

For example, a card ID like `102123456` breaks down as:

- `1`: Version identifier
- `02`: Chain prefix (Base network)
- `123456`: Card number (derived from the slot ID)

## Component Details

### Version Identifier

The first digit indicates the contract version:

- `1`: Current version of the UniVoucher contract

Future contract upgrades may use different version identifiers. This allows the system to distinguish between cards created with different contract versions.

### Chain Prefix

The next two digits identify the blockchain network where the card exists:

| Chain Prefix | Network | Chain ID |
|--------------|---------|----------|
| 01 | Ethereum | 1 |
| 02 | Base | 8453 |
| 03 | BNB Chain | 56 |
| 04 | Polygon | 137 |
| 05 | Arbitrum | 42161 |
| 06 | Optimism | 10 |
| 07 | Avalanche | 43114 |

This prefix ensures that card IDs are unique across different networks and helps the interface determine which network to query when looking up a card.

### Card Number

The remaining digits form the card number, which is derived from the card's slot ID (public key).

The card number is generated as follows:

1. Take the slot ID (Ethereum address)
2. Apply a deterministic algorithm to convert it to a numeric value
3. Ensure the result has no collisions with existing card numbers

## ID Generation Process

When a card is created, the contract follows these steps to generate the ID:

1. The client generates a random Ethereum key pair
2. The public key (address) becomes the slot ID
3. The contract takes the slot ID and applies the following algorithm:
   - Combine the version, chain prefix, and a deterministic transformation of the slot ID
   - Store this mapping in the contract
   - Return the complete card ID

The mapping between slot IDs and card IDs is stored on-chain, allowing lookups in either direction.

## Card ID Validation

Valid UniVoucher card IDs have these characteristics:

- They start with a valid version number
- They contain a recognized chain prefix
- They correspond to an actual slot ID in the contract
- They have the correct length (typically 8-12 digits)

## Parsing Card IDs

The UniVoucher interface automatically parses card IDs to determine:

1. Which contract version to interact with
2. Which network to connect to
3. Which slot ID to look up

Developers can use the `parseCardId` utility function to extract this information from a card ID:

```javascript
// Example implementation (simplified)
function parseCardId(cardId) {
  if (!cardId || cardId.length < 3) return null;
  
  try {
    // Extract version (first digit) and chain prefix (second and third digits)
    const versionPrefix = cardId.charAt(0);
    const chainPrefix = cardId.substring(1, 3);
    
    // Find the matching chain
    const chain = getChainByPrefix(chainPrefix);
    
    if (chain) {
      return {
        version: versionPrefix,
        chainPrefix,
        chainId: chain.id,
        cardNumber: cardId.substring(3) // Start after the first three digits
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error parsing card ID:", err);
    return null;
  }
}
```

## Common ID Formats by Network

Based on the current format, you can expect card IDs to follow these patterns:

| Network | ID Format | Example |
|---------|-----------|---------|
| Ethereum | 1 + 01 + numbers | 101123456 |
| Base | 1 + 02 + numbers | 102123456 |
| BNB Chain | 1 + 03 + numbers | 103123456 |
| Polygon | 1 + 04 + numbers | 104123456 |
| Arbitrum | 1 + 05 + numbers | 105123456 |
| Optimism | 1 + 06 + numbers | 106123456 |
| Avalanche | 1 + 07 + numbers | 107123456 |

## Cross-Chain Considerations

Important notes about card IDs across chains:

- Card IDs are globally unique across all supported networks
- The chain prefix makes it impossible for two cards to have the same ID
- Cards can only be redeemed on the network indicated by their chain prefix
- The version and chain prefix help the interface automatically connect to the correct network

## Benefits of this Format

The structured card ID format provides several advantages:

1. **Human Readability**: Numeric IDs are easier to share and input than Ethereum addresses
2. **Network Identification**: The chain prefix immediately identifies which network the card is on
3. **Version Control**: The version digit allows for future protocol upgrades
4. **Collision Prevention**: IDs are guaranteed to be unique across all chains
5. **Automatic Routing**: The interface can determine which network to query based on the ID
