# Security Considerations

This page outlines important security considerations for developers integrating with or building on top of UniVoucher. Understanding these security aspects will help you create secure applications and avoid common pitfalls.

## Smart Contract Security

### Contract Verification

All UniVoucher contracts have been deployed with verified source code on block explorers:

- The contract code can be audited by anyone
- All functions and their purposes are publicly documented
- No hidden functionality or backdoors exist

### Permission Model

The contract implements a straightforward permission model:

- Card creators can only cancel their own cards
- Anyone with a valid card secret can redeem a card
- Only the contract owner can withdraw accumulated fees

### Reentrancy Protection

The contract includes protections against reentrancy attacks:

- State changes happen before external calls
- Functions that require reentrancy protection use appropriate checks
- Token transfers occur after all state changes

## Cryptographic Security

### Key Generation

When generating cryptographic keys:

- Use cryptographically secure random number generators
- Ensure adequate entropy for all random values
- Generate new keypairs for each card
- Never reuse keys across cards

```javascript
// Secure key generation example
function generateSecureKeypair() {
  // Use the built-in cryptographic RNG
  return ethers.Wallet.createRandom();
}
```

### Secret Management

When handling card secrets:

- Never store secrets in localStorage or cookies
- Don't log secrets to the console or server logs
- Clear secrets from memory when no longer needed
- Use secure channels for secret transmission

```javascript
// Example of secure secret handling
async function handleCardSecret(secret) {
  try {
    // Use the secret for the required operation
    const result = await performOperation(secret);
    
    // Immediately clear the secret from the form
    document.getElementById('secretInput').value = '';
    
    return result;
  } catch (error) {
    // Clear the secret even if an error occurs
    document.getElementById('secretInput').value = '';
    throw error;
  }
}
```

### Encryption Best Practices

For client-side encryption operations:

- Use established algorithms (PBKDF2, AES-GCM)
- Apply appropriate key derivation parameters
- Include authentication tags to verify decryption
- Use unique salt and IV values for each encryption

```javascript
// Example of proper encryption parameters
const encryptionParams = {
  keyDerivation: {
    algorithm: "PBKDF2",
    hash: "SHA-256",
    iterations: 310000, // Substantial iteration count
    saltLength: 16      // 128 bits
  },
  encryption: {
    algorithm: "AES-GCM",
    keyLength: 256,     // 256-bit keys
    ivLength: 12        // 96 bits (recommended for GCM)
  }
};
```

## Frontend Security

### Input Validation

Always validate user inputs:

- Sanitize all form inputs
- Validate amounts against minimum and maximum values
- Check token addresses against expected formats
- Verify card IDs follow the correct pattern

```javascript
// Example of input validation
function validateCardId(cardId) {
  // Card ID should be numeric and follow the pattern [version][chain prefix][card number]
  if (!/^\d+$/.test(cardId)) {
    return false;
  }
  
  // Must be at least 4 chars long (1 for version, 2 for chain prefix, remaining card number)
  if (cardId.length < 4) {
    return false;
  }
  
  // Extract chain prefix and check if it's valid
  const chainPrefix = cardId.substring(1, 3);
  const validPrefixes = ["01", "02", "03", "04", "05", "06", "07"];
  
  return validPrefixes.includes(chainPrefix);
}
```

### Transaction Security

When submitting blockchain transactions:

- Always use the most recent provider state
- Let the user's wallet handle gas prices for optimal fee estimation
- Check for existing transactions before submitting new ones
- Handle transaction errors gracefully

```javascript
// Example of secure transaction submission
async function submitTransaction(txFunction, options = {}) {
  try {
    // Let the wallet handle gas estimation and pricing completely
    // Modern wallets have sophisticated gas price algorithms
    const tx = await txFunction(options);
    
    return await tx.wait();
  } catch (error) {
    // Handle different error types appropriately
    if (error.code === 4001) {
      // User rejected transaction
      throw new Error("Transaction cancelled by user");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient funds for transaction");
    } else {
      throw error;
    }
  }
}
```

### Secure Communication

For data exchange:

- Use HTTPS for all API communication
- Implement proper CORS policies
- Don't transmit sensitive data in URLs
- Consider using end-to-end encryption for sensitive information

## Card Distribution Security

### Secret Sharing

When sharing card secrets:

- Use secure communication channels
- Consider encrypted messaging apps
- Avoid sharing ID and secret through the same channel
- Use temporary/expiring messaging when possible

### Redemption Verification

Implement proper verification:

- Verify the card exists before attempting redemption
- Check card status before processing
- Validate the provided secret before submitting transactions
- Detect and prevent brute force attempts

```javascript
// Example of redemption verification
async function verifyBeforeRedemption(cardId, secret) {
  // Check card exists and is active
  const cardData = await contract.getCardData(cardId);
  if (!cardData[0]) { // Not active
    throw new Error("This card is not active");
  }
  
  // Verify the secret works before submitting a transaction
  try {
    const privateKey = decryptPrivateKey(cardData[6], secret);
    return true;
  } catch (error) {
    throw new Error("Invalid card secret");
  }
}
```

## Bug Bounty and Vulnerability Reporting

If you discover a security vulnerability in UniVoucher:

1. Do not disclose it publicly
2. Do not exploit the vulnerability
3. Contact the UniVoucher team immediately at security@univoucher.com
4. Provide detailed information about the vulnerability
5. Allow reasonable time for the issue to be addressed

Responsible disclosure helps maintain the security of the platform for everyone. UniVoucher offers rewards for responsibly reported vulnerabilities based on severity. Rewards are determined based on impact, exploitability, and quality of the report. 

!!! note "Eligibility Requirements"
    To be eligible for a reward, the vulnerability must be:
    - Previously unreported
    - Affect the UniVoucher smart contracts or official web application
    - Include clear reproduction steps
    - Reported through proper channels before any public disclosure
