# Integration Guide

This guide provides step-by-step instructions for integrating UniVoucher functionality into your own applications. Whether you're building a dApp, a rewards platform, or a gifting service, you can leverage UniVoucher's capabilities through the smart contract interface.

## Integration Approach

UniVoucher is a fully decentralized application, which means all core functionality operates directly through blockchain smart contracts. Unlike traditional platforms, there is no centralized backend that processes or stores tangible gift card data - everything is securely stored on the blockchain and generated locally on users' devices.

This architecture requires direct interaction with the UniVoucher smart contract for all actions that modify state (creating cards, redeeming cards, cancellations). However, we do provide a read-only API at [api.univoucher.com](https://api.univoucher.com) that indexes blockchain data for easier querying and integration. This API can be helpful for retrieving card information, checking statuses, and building user interfaces without having to directly query the blockchain for historical data.

For the complete API specification, refer to the [OpenAPI documentation](https://api.univoucher.com/openapi.yaml) or check our [API Reference](api-reference.md) page. The API provides endpoints for retrieving card data, fee information, and blockchain details, but remember that all state-changing operations must be performed via direct smart contract interaction.


!!! info "Prerequisites"
    Before integrating, ensure you have:

    - Basic understanding of Web3 development
    - Experience with Ethereum contract interactions
    - A Web3 provider setup in your application


### Step 1: Set Up Contract Interface

This step initializes the contract interface using ethers.js. We define the minimal ABI (Application Binary Interface) containing only the essential functions needed for integration, and set up a helper function to create contract instances.


```javascript
import { ethers } from 'ethers';

// UniVoucher ABI (minimal version with essential functions)
const UniVoucherABI = [
  "function depositETH(address slotId, uint256 amount, string memory message, string memory encryptedPrivateKey) external payable",
  "function depositERC20(address slotId, address tokenAddress, uint256 amount, string memory message, string memory encryptedPrivateKey) external",
  "function redeemCard(string memory cardId, address payable to, bytes memory signature, address payable partner) external",
  "function cancelCard(string memory cardId) external",
  "function getCardData(string memory cardId) external view returns (bool active, address tokenAddress, uint256 tokenAmount, uint256 feePaid, address creator, string memory message, string memory encryptedPrivateKey, address slotId, uint256 timestamp, address redeemedBy, address cancelledBy, address partnerAddress, uint256 finalizedTimestamp)",
  "event CardCreated(string cardId, address indexed slotId, address indexed creator, address tokenAddress, uint256 tokenAmount, uint256 feePaid, string message, string encryptedPrivateKey, uint256 timestamp)",
  "event CardRedeemed(string cardId, address indexed slotId, address indexed to, address tokenAddress, uint256 amount, address indexed partner, uint256 timestamp)"
];

// Contract address (same on all networks)
const UNIVOUCHER_ADDRESS = '0x51553818203e38ce0E78e4dA05C07ac779ec5b58';

// Create contract instance
function getUniVoucherContract(providerOrSigner) {
  return new ethers.Contract(UNIVOUCHER_ADDRESS, UniVoucherABI, providerOrSigner);
}
```
!!! tip "Smart Contract Details"
    For complete details on the smart contract logic and functions, see the [Smart Contract documentation](../technical/smart-contract.md).

---

### Step 2: Implement Cryptographic Helper Functions

These cryptographic functions handle the secure generation and management of card secrets. The generateFriendlySecret function creates human-readable redemption codes, while the encryption/decryption functions secure the private keys using industry-standard PBKDF2 and AES-GCM algorithms.

```javascript
// Generate a friendly secret
function generateFriendlySecret() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = '';
  
  // Generate 4 groups of 5 characters
  for (let group = 0; group < 4; group++) {
    for (let i = 0; i < 5; i++) {
      const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % charset.length;
      result += charset[randomIndex];
    }
    
    if (group < 3) {
      result += '-';
    }
  }
  
  return result;
}

// Encrypt a private key using PBKDF2 and AES-GCM
async function encryptPrivateKey(privateKey, friendlySecret) {
  // Remove hyphens from the secret
  const normalizedSecret = friendlySecret.replace(/-/g, '');
  
  // Generate salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import the secret as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalizedSecret),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive a key using PBKDF2
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
    ["encrypt"]
  );
  
  // Encrypt the private key
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    new TextEncoder().encode(privateKey)
  );
  
  // Format the result as JSON
  return JSON.stringify({
    salt: Array.from(new Uint8Array(salt)).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(new Uint8Array(iv)).map(b => b.toString(16).padStart(2, '0')).join(''),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
  });
}

// Decrypt an encrypted private key
async function decryptPrivateKey(encryptedData, friendlySecret) {
  try {
    // Parse the encrypted data
    const data = JSON.parse(encryptedData);
    
    // Convert formats
    const normalizedSecret = friendlySecret.replace(/-/g, '');
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
    
    // Derive the key
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
      {
        name: "AES-GCM",
        iv
      },
      key,
      ciphertext
    );
    
    // Return the decrypted private key
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error("Invalid card secret or corrupted data");
  }
}
```
!!! tip "Signature Verification"
    For details on how card signatures are verified during redemption, see the [Signature Verification documentation](../technical/card-security.md#signature-verification).

---

### Step 3: Implement Card Creation

This function handles the creation of new gift cards, supporting both native tokens (ETH, BNB, etc.) and ERC-20 tokens. It generates a random wallet for the card, encrypts the private key with a user-friendly secret, and handles the blockchain transactions including fee calculations and token approvals.

```javascript
async function createCard(provider, tokenAddress, amount, message = "") {
  try {
    const signer = provider.getSigner();
    const contract = getUniVoucherContract(signer);
    
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    const slotId = wallet.address;
    const privateKey = wallet.privateKey;
    
    // Generate a friendly secret and encrypt the private key
    const friendlySecret = generateFriendlySecret();
    const encryptedPrivateKey = await encryptPrivateKey(privateKey, friendlySecret);
    
    let tx, receipt;
    
    if (tokenAddress === ethers.constants.AddressZero) {
      // Native token (ETH, BNB, AVAX, etc.)
      const amountWei = ethers.utils.parseEther(amount.toString());
      const feeWei = await contract.calculateFee(amountWei);
      const totalValue = amountWei.add(feeWei);
      
      tx = await contract.depositETH(slotId, amountWei, message, encryptedPrivateKey, {
        value: totalValue
      });
    } else {
      // ERC-20 token
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)", "function approve(address, uint256) returns (bool)"],
        signer
      );
      
      // Get token decimals
      let decimals;
      try {
        decimals = await tokenContract.decimals();
      } catch (err) {
        decimals = 18; // Default
      }
      
      // Parse amount with proper decimals
      const amountInTokenUnits = ethers.utils.parseUnits(amount.toString(), decimals);
      const feeInTokenUnits = await contract.calculateFee(amountInTokenUnits);
      const totalTokens = amountInTokenUnits.add(feeInTokenUnits);
      
      // Approve tokens for the contract
      const approveTx = await tokenContract.approve(contract.address, totalTokens);
      await approveTx.wait();
      
      // Create ERC-20 card
      tx = await contract.depositERC20(slotId, tokenAddress, amountInTokenUnits, message, encryptedPrivateKey);
    }
    
    // Wait for transaction to be mined
    receipt = await tx.wait();
    
    // Find the CardCreated event
    const event = receipt.events.find(e => e.event === 'CardCreated' && e.args.slotId === slotId);
    if (!event) {
      throw new Error("Card creation event not found");
    }
    
    // Return card details
    return {
      cardId: event.args.cardId,
      cardSecret: friendlySecret,
      txHash: receipt.transactionHash,
      amount,
      tokenAddress,
      message
    };
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
}
```

### Step 4: Implement Card Redemption

This function handles the redemption process for gift cards. It decrypts the private key using the provided card secret, creates a cryptographic signature to prove ownership, and calls the smart contract to transfer the funds to the recipient address. Optionally, it can specify a partner address to receive 1% of the card amount as a partner fee.

```javascript
async function redeemCard(provider, cardId, cardSecret, recipientAddress = null, partnerAddress = null) {
  try {
    const signer = provider.getSigner();
    const contract = getUniVoucherContract(signer);
    
    // If no recipient provided, use the connected wallet
    if (!recipientAddress) {
      recipientAddress = await signer.getAddress();
    }
    
    // Get card data
    const cardData = await contract.getCardData(cardId);
    if (!cardData[0]) { // Not active
      throw new Error("This card is not active");
    }
    
    // Get encrypted private key from card data
    const encryptedPrivateKey = cardData[6];
    
    // Decrypt private key
    const privateKey = await decryptPrivateKey(encryptedPrivateKey, cardSecret);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    // Create message hash
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string", "address"],
      ["Redeem card:", cardId, "to:", recipientAddress]
    );
    
    // Sign the hash
    const arrayifiedHash = ethers.utils.arrayify(messageHash);
    const signature = await wallet.signMessage(arrayifiedHash);
    
    // Call the redeem function with partner address (use address(0) if no partner)
    const partner = partnerAddress || ethers.constants.AddressZero;
    const tx = await contract.redeemCard(cardId, recipientAddress, signature, partner);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      recipientAddress,
      partnerAddress: partnerAddress
    };
  } catch (error) {
    console.error("Error redeeming card:", error);
    throw error;
  }
}
```

### Step 5: Implement Card Cancellation

This function allows card creators to cancel active cards and reclaim their funds. It verifies the card is still active before attempting cancellation and handles the blockchain transaction process.

```javascript
async function cancelCard(provider, cardId) {
  try {
    const signer = provider.getSigner();
    const contract = getUniVoucherContract(signer);
    
    // Check if card is active
    const isActive = await contract.isCardActive(cardId);
    if (!isActive) {
      throw new Error("Card is not active");
    }
    
    // Cancel the card
    const tx = await contract.cancelCard(cardId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error cancelling card:", error);
    throw error;
  }
}
```

### Step 6: Implement Card Data Retrieval

This function retrieves detailed information about a specific card from the blockchain. It formats the raw contract data into a more developer-friendly structure that can be easily used in applications.

```javascript
async function getCardDetails(provider, cardId) {
  try {
    const contract = getUniVoucherContract(provider);
    
    // Get card data
    const data = await contract.getCardData(cardId);
    
    // Format the result
    return {
      active: data[0],
      tokenAddress: data[1],
      tokenAmount: data[2].toString(),
      feePaid: data[3].toString(),
      creator: data[4],
      message: data[5],
      encryptedPrivateKey: data[6],
      slotId: data[7],
      timestamp: data[8].toNumber(),
      redeemedBy: data[9],
      cancelledBy: data[10],
      partnerAddress: data[11],
      finalizedTimestamp: data[12].toNumber()
    };
  } catch (error) {
    console.error("Error fetching card data:", error);
    throw error;
  }
}
```

## Partner Integration

### Earning Partner Fees

Partners can earn a 1% fee from card redemptions by providing their address during the redemption process:

```javascript
// Example: Redeem a card with partner fee
async function redeemWithPartnerFee(provider, cardId, cardSecret, partnerAddress) {
  const recipientAddress = await provider.getSigner().getAddress();
  
  return await redeemCard(provider, cardId, cardSecret, recipientAddress, partnerAddress);
}

// Example: Check if a card was redeemed through a partner
async function checkPartnerRedemption(provider, cardId) {
  const cardDetails = await getCardDetails(provider, cardId);
  
  if (cardDetails.partnerAddress && cardDetails.partnerAddress !== ethers.constants.AddressZero) {
    console.log(`Card was redeemed through partner: ${cardDetails.partnerAddress}`);
    return cardDetails.partnerAddress;
  }
  
  return null;
}
```

### Partner Fee Details

- **Fee Amount**: 1% of the card amount (minimum 1 wei)
- **Fee Source**: Deducted from the card amount
- **Payment**: Sent directly to partner address during redemption
- **Recipient**: Gets the remaining 99% of the card amount

For example, a 100 USDC card redeemed through a partner:
- Partner receives: 1 USDC
- Recipient receives: 99 USDC

## Best Practices for Integration

### Security

1. **Secure Storage**: Never store card secrets in plaintext or in browser storage
2. **Transport Security**: Always use HTTPS for any API that handles card information
3. **Minimize Exposure**: Only expose card secrets when necessary for redemption

### User Experience

1. **Provide Clear Instructions**: Explain how cards work to users
2. **Error Handling**: Give clear, actionable error messages
3. **Loading States**: Show appropriate loading indicators during blockchain operations
4. **Confirmation**: Provide clear confirmation when operations succeed

### Technical

1. **Error Handling**: Implement robust error handling for all blockchain interactions
2. **Gas Management**: Let the user's wallet handle gas prices for optimal fee estimation
3. **Network Detection**: Automatically detect and handle network changes
4. **Transaction Monitoring**: Monitor transaction status and handle reorgs

## Troubleshooting Common Issues

### Transaction Failing

- Check gas price settings
- Verify token approvals
- Ensure sufficient balance for gas
- Check network congestion

### Card Creation Errors

- Verify token contract is valid
- Ensure adequate approval for tokens
- Check token balance includes fee amount
- Verify cryptographic functions are working properly

### Redemption Errors

- Confirm card is still active
- Verify card secret is entered correctly
- Ensure connected to the correct network
- Check if signature generation is working

## Support and Resources

For additional help with your integration:

- Review the [Smart Contract Documentation](../technical/smart-contract.md)
- Explore the [Security Considerations](security.md)
- Check out the [API Reference](api-reference.md)

By following this integration guide, you can successfully incorporate UniVoucher functionality into your applications, providing a seamless gifting experience for your users.
