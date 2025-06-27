# Partner Program

UniVoucher's Partner Program is designed for integration partners including wallets, crypto exchanges, bridges, payment gateways, and other services that enable gift card redemption functionality. Partners earn a **1% fee** on every redemption transaction they facilitate.

## Program Overview

UniVoucher's decentralized, open-source ecosystem allows anyone to instantly integrate without prior approval and start earning partner fees immediately. The 1% partner fee is **hardcoded into the smart contract**, ensuring automatic and transparent fee distribution.

### Key Benefits

- **Instant Integration**: No approval process required - start earning immediately
- **Guaranteed Payments**: Fees are hardcoded in the smart contract and paid automatically
- **Transparent Revenue**: All partner fees are visible on-chain
- **Zero Risk**: No upfront costs or commitments
- **Multi-Chain Support**: Earn fees across all supported networks

### How It Works

1. **Integration**: Implement UniVoucher redemption functionality in your platform
2. **Partner Address**: Include your wallet address when facilitating redemptions
3. **Automatic Fees**: Receive 1% of every redemption transaction instantly
4. **On-Chain Transparency**: All fees are recorded and verifiable on-chain

## Fee Structure

### Partner Fee Details

- **Fee Rate**: 1% of the card amount (hardcoded in smart contract)
- **Fee Source**: Deducted from the card amount during redemption
- **Payment Method**: Sent directly to partner address in the same transaction
- **Minimum Fee**: 1 wei (smallest unit of the token)

### Fee Distribution Example

When a 100 USDC card is redeemed through a partner:

- **Partner receives**: 1 USDC (1% partner fee)
- **Recipient receives**: 99 USDC (remaining amount)
- **Total card value**: 100 USDC (unchanged)

## Technical Integration

### Smart Contract Integration

The partner fee is implemented directly in the `redeemCard` function:

```solidity
function redeemCard(
    string memory cardId, 
    address payable to, 
    bytes memory signature,
    address payable partner  // ← Partner address parameter
) external
```

### Implementation Example

Here's a complete example of redeeming a card with partner fees, based on the RedeemNow implementation:

```javascript
// Import required libraries
import { ethers } from 'ethers';

// UniVoucher contract configuration
const UNIVOUCHER_ADDRESS = '0x51553818203e38ce0E78e4dA05C07ac779ec5b58';
const PARTNER_ADDRESS = '0xYourPartnerAddress'; // Your partner wallet address

// Minimal ABI for redemption
const UniVoucherABI = [
  "function redeemCard(string memory cardId, address payable to, bytes memory signature, address payable partner) external",
  "function getCardData(string memory cardId) external view returns (bool active, address tokenAddress, uint256 tokenAmount, uint256 feePaid, address creator, string memory message, string memory encryptedPrivateKey, address slotId, uint256 timestamp, address redeemedBy, address cancelledBy, address partnerAddress, uint256 finalizedTimestamp)"
];

// Complete redemption function with partner fee
async function redeemCardWithPartnerFee(provider, cardId, cardSecret, recipientAddress) {
  try {
    // Create contract instance
    const signer = provider.getSigner();
    const contract = new ethers.Contract(UNIVOUCHER_ADDRESS, UniVoucherABI, signer);
    
    // Get card data to verify it's active
    const cardData = await contract.getCardData(cardId);
    if (!cardData[0]) { // Check if active
      throw new Error("Card is not active");
    }
    
    // Decrypt the private key using the card secret
    const encryptedPrivateKey = cardData[6];
    const privateKey = await decryptPrivateKey(encryptedPrivateKey, cardSecret);
    
    // Create wallet from private key to generate signature
    const wallet = new ethers.Wallet(privateKey);
    
    // Create the message hash for signing
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string", "address"],
      ["Redeem card:", cardId, "to:", recipientAddress]
    );
    
    // Sign the message
    const arrayifiedHash = ethers.utils.arrayify(messageHash);
    const signature = await wallet.signMessage(arrayifiedHash);
    
    // Execute redemption with partner address
    const tx = await contract.redeemCard(
      cardId,
      recipientAddress,
      signature,
      PARTNER_ADDRESS  // ← This enables the 1% partner fee
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      partnerFeeEarned: true
    };
    
  } catch (error) {
    console.error("Redemption failed:", error);
    throw error;
  }
}

// Helper function for decrypting card private keys
async function decryptPrivateKey(encryptedData, cardSecret) {
  try {
    const data = JSON.parse(encryptedData);
    const normalizedSecret = cardSecret.replace(/-/g, '');
    
    // Convert hex strings to appropriate formats
    const salt = new Uint8Array(data.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(data.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const ciphertext = Uint8Array.from(atob(data.ciphertext), c => c.charCodeAt(0));
    
    // Import the secret as key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(normalizedSecret),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    // Derive the decryption key
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 310000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decrypt the private key
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error("Invalid card secret");
  }
}

// Usage example
async function handleRedemption(cardId, cardSecret, recipientAddress) {
  try {
    // Assuming you have a Web3 provider setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const result = await redeemCardWithPartnerFee(
      provider,
      cardId,
      cardSecret,
      recipientAddress
    );
    
    console.log("Redemption successful:", result.txHash);
    console.log("Partner fee earned: 1% of card amount");
    
  } catch (error) {
    console.error("Redemption failed:", error.message);
  }
}
```

### Gasless Integration

For gasless redemption services (where partners pay gas fees for users):

```javascript
// Server-side gasless redemption with partner fees
async function gaslessRedeemWithPartnerFee(cardId, cardSecret, recipientAddress) {
  try {
    // Use service wallet to pay gas fees
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const serviceWallet = new ethers.Wallet(SERVICE_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(UNIVOUCHER_ADDRESS, UniVoucherABI, serviceWallet);
    
    // Verify card and get data
    const cardData = await contract.getCardData(cardId);
    if (!cardData[0]) {
      throw new Error("Card is not active");
    }
    
    // Decrypt private key (server-side implementation)
    const encryptedPrivateKey = cardData[6];
    const privateKey = await decryptPrivateKeyNodeJS(encryptedPrivateKey, cardSecret);
    
    // Generate signature
    const wallet = new ethers.Wallet(privateKey);
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string", "address"],
      ["Redeem card:", cardId, "to:", recipientAddress]
    );
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    
    // Execute with proper gas estimation
    const gasEstimate = await contract.estimateGas.redeemCard(
      cardId, recipientAddress, signature, PARTNER_ADDRESS
    );
    const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
    
    const tx = await contract.redeemCard(
      cardId,
      recipientAddress,
      signature,
      PARTNER_ADDRESS,
      { gasLimit }
    );
    
    return await tx.wait();
    
  } catch (error) {
    console.error("Gasless redemption failed:", error);
    throw error;
  }
}
```

## Partner Examples

### RedeemNow - Gasless Redemption Service

**[RedeemNow](https://redeemnow.xyz)** is a prime example of the UniVoucher Partner Program in action. It provides gasless gift card redemption services while earning partner fees.

#### Key Features

- **Gasless Redemptions**: Users redeem cards without connecting wallets or paying gas fees
- **Multi-Chain Support**: Works across all UniVoucher-supported networks
- **Partner Fee Integration**: Earns 1% on every redemption automatically
- **Open Source**: Full source code available for learning and forking

#### Technical Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript with responsive design
- **Backend**: Node.js with Express.js and ethers.js
- **Blockchain Integration**: Alchemy RPC providers for reliable connectivity
- **Security**: Environment-based configuration with proper input validation

#### Repository & Links

- **Live Demo**: [https://redeemnow.xyz](https://redeemnow.xyz)
- **Source Code**: [GitHub Repository](https://github.com/UniVoucher/RedeemNow)
- **License**: Open source - free to clone and customize
- **Built With**: [Cursor IDE](https://cursor.sh), [Claude 4 Sonnet](https://claude.ai), and [UniVoucher MCP](https://docs.univoucher.com/developers/mcp)

!!! tip "Fork RedeemNow"
    RedeemNow is completely open source and designed to be easily forked. Clone the repository and deploy your own gasless redemption service in minutes.


## Fee Calculation Examples

| Card Amount | Partner Fee (1%) | Your Revenue |
|-------------|------------------|--------------|
| $10 USDC    | $0.10 USDC      | $0.10        |
| $100 USDC   | $1.00 USDC      | $1.00        |
| $1,000 USDC | $10.00 USDC     | $10.00       |
| 1 ETH       | 0.01 ETH        | ~$30         |
| 10 BNB      | 0.1 BNB         | ~$60         |


!!! success "Growing Market"
    As crypto adoption increases and gift card usage grows, partner revenue potential continues to expand across multiple blockchain networks.

## Technical Documentation

- **[Integration Guide](developers/integration-guide.md)**: Complete technical integration guide
- **[Smart Contract](technical/smart-contract.md)**: Detailed smart contract documentation
- **[API Reference](developers/api-reference.md)**: UniVoucher API documentation
- **[Security Guide](developers/security.md)**: Security best practices

---

!!! info "Start Earning Today"
    The UniVoucher Partner Program requires no approval, contracts, or upfront costs. Simply integrate the redemption functionality with your partner address and start earning 1% on every transaction immediately.