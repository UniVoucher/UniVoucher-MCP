# Integration Guide

This guide provides step-by-step instructions for integrating UniVoucher functionality into your own applications. Whether you're building a dApp, a rewards platform, or a gifting service, you can leverage UniVoucher's capabilities through the smart contract interface.

## Integration Architecture Patterns

Understanding the right architecture for your use case is crucial for a successful integration. Choose the pattern that best fits your application's requirements.

### Client-Side Integration (Recommended for Web Apps)

Best for user-facing applications where users directly interact with cards.

**Architecture:**
- Frontend calls UniVoucher API directly for card data retrieval
- Frontend handles decryption and signature creation using Web Crypto API
- Backend handles business logic and optional gasless transactions

**Advantages:**
- Better security (secrets never leave user's device)
- Reduced server load
- Real-time blockchain interaction

**Use Cases:**
- Gift card marketplaces
- User dashboards
- Direct redemption interfaces

### Server-Side Integration

Best for server-to-server integrations and automated systems.

**Architecture:**
- Backend handles all UniVoucher operations
- Requires secure secret management
- Direct smart contract interaction from server

**Advantages:**
- Centralized control
- Easier monitoring and logging
- Suitable for batch operations

**Use Cases:**
- Automated reward distribution
- API-based card creation
- Backend reward systems

### Hybrid Integration

Optimal balance for applications requiring both user interaction and server control.

**Architecture:**
- Frontend: Card checking, decryption, signature creation
- Backend: Gasless transaction execution, business logic
- Combined approach for optimal UX and security

**Advantages:**
- Best user experience
- Secure secret handling
- Flexible transaction management

**Use Cases:**
- Gasless redemption services
- Enterprise integrations
- Multi-user platforms

## Integration Approach

UniVoucher is a fully decentralized application, which means all core functionality operates directly through blockchain smart contracts. Unlike traditional platforms, there is no centralized backend that processes or stores tangible gift card data - everything is securely stored on the blockchain and generated locally on users' devices.

This architecture requires direct interaction with the UniVoucher smart contract for all actions that modify state (creating cards, redeeming cards, cancellations). However, we do provide a read-only API at [api.univoucher.com](https://api.univoucher.com) that indexes blockchain data for easier querying and integration. This API can be helpful for retrieving card information, checking statuses, and building user interfaces without having to directly query the blockchain for historical data.

For the complete API specification, refer to the [OpenAPI documentation](https://api.univoucher.com/openapi.yaml) or check our [API Reference](api-reference.md) page. The API provides endpoints for retrieving card data, fee information, and blockchain details, but remember that all state-changing operations must be performed via direct smart contract interaction.

!!! info "Prerequisites"
    Before integrating, ensure you have:

    - Basic understanding of Web3 development
    - Experience with Ethereum contract interactions
    - A Web3 provider setup in your application
    - Production-ready RPC provider (Alchemy, Infura, QuickNode)

## Security & Configuration Requirements

### Content Security Policy (CSP) Configuration

For web applications, configure CSP to allow necessary external connections:

```javascript
// Express.js with Helmet example
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'", 
                "https://api.univoucher.com",           // UniVoucher API
                "https://*.g.alchemy.com",              // Alchemy RPC
                "https://*.infura.io",                  // Infura RPC (if used)
                "https://*.quicknode.com"               // QuickNode RPC (if used)
            ],
            scriptSrc: [
                "'self'", 
                "https://unpkg.com",                    // For ethers.js CDN
                "https://cdn.jsdelivr.net"             // Alternative CDN
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"]
        },
    },
}));
```

### Production RPC Configuration

⚠️ **Critical: Never use public RPC endpoints in production**

Public RPCs are unreliable, rate-limited, and unsuitable for production applications.

**Recommended Providers:**

- **Alchemy** (Recommended) - Reliable, well-documented
- **Infura** - Established provider with good uptime
- **QuickNode** - High-performance option

**Secure RPC Pattern for Web Applications:**

```javascript
// Backend endpoint to provide RPC URLs securely
app.get('/api/rpc/:chainId', (req, res) => {
    const chainId = parseInt(req.params.chainId);
    
    const alchemyNetworks = {
        1: 'eth-mainnet',
        10: 'opt-mainnet', 
        56: 'bnb-mainnet',
        137: 'polygon-mainnet',
        8453: 'base-mainnet',
        42161: 'arb-mainnet',
        43114: 'avax-mainnet'
    };
    
    const network = alchemyNetworks[chainId];
    if (!network || !process.env.ALCHEMY_KEY) {
        return res.status(400).json({ error: 'Unsupported chain or missing API key' });
    }
    
    const rpcUrl = `https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;
    res.json({ rpcUrl });
});

// Frontend usage
async function getProvider(chainId) {
    const response = await fetch(`/api/rpc/${chainId}`);
    const { rpcUrl } = await response.json();
    return new ethers.providers.JsonRpcProvider(rpcUrl);
}
```

### Gas Estimation and Pricing

Proper gas estimation is crucial for successful transactions across different networks. Each blockchain has different gas pricing mechanisms and costs.

#### Backend/Server-Side Applications

For server-side integrations (like gasless services), implement automatic gas estimation:

```javascript
// Alchemy-powered gas estimation (recommended)
async function getGasEstimate(provider, contract, method, params) {
    // Get current gas price from provider
    const gasPrice = await provider.getGasPrice();
    
    // Estimate gas for the specific transaction
    const gasEstimate = await contract.estimateGas[method](...params);
    
    // Add 20% buffer for safety
    const gasLimit = gasEstimate.mul(120).div(100);
    
    return {
        gasLimit,
        gasPrice
    };
}

// Example usage in transaction
async function executeTransaction(chainId, signer, contract, method, params) {
    const gasSettings = await getGasEstimate(signer.provider, contract, method, params);
    
    const tx = await contract[method](...params, gasSettings);
    return await tx.wait();
}
```

**Alternative: Using Wallet Kit or Other Gas APIs**

```javascript
// Using a wallet kit's gas estimation
async function getGasWithWalletKit(walletKit, chainId, txData) {
    const gasEstimate = await walletKit.estimateGas({
        chainId,
        to: txData.to,
        data: txData.data
    });
    
    return {
        gasLimit: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice
    };
}

// Using Alchemy Gas Manager API
async function getGasWithAlchemyAPI(alchemyKey, chainId, txData) {
    const response = await fetch(`https://gas-api.metaswap.codefi.network/networks/${chainId}/suggestedGasFees`, {
        headers: { 'Authorization': `Bearer ${alchemyKey}` }
    });
    
    const gasData = await response.json();
    
    return {
        gasLimit: await estimateGasLimit(txData),
        gasPrice: ethers.utils.parseUnits(gasData.medium.suggestedMaxFeePerGas, 'gwei')
    };
}
```

#### Frontend/User Wallet Applications

For user-facing applications where users connect their wallets, **always let the user's wallet handle gas estimation**:

```javascript
// ✅ Correct: Let wallet handle gas estimation
async function redeemCardUserWallet(provider, cardId, cardSecret, recipientAddress) {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(UNIVOUCHER_ADDRESS, ABI, signer);
    
    // Don't specify gas settings - let wallet estimate
    const tx = await contract.redeemCard(cardId, recipientAddress, signature, partnerAddress);
    
    return await tx.wait();
}

// ❌ Incorrect: Don't override wallet gas estimation
async function redeemCardWithManualGas(provider, cardId, cardSecret, recipientAddress) {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(UNIVOUCHER_ADDRESS, ABI, signer);
    
    // This overrides the user's wallet settings and may cause failures
    const tx = await contract.redeemCard(cardId, recipientAddress, signature, partnerAddress, {
        gasLimit: 150000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    });
    
    return await tx.wait();
}
```

**Why Let Wallets Handle Gas:**

- Wallets have real-time network awareness
- Users can adjust gas based on urgency
- Wallets handle EIP-1559 vs legacy gas pricing automatically
- Better UX - users control their transaction costs
- Prevents failed transactions due to outdated gas estimates

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
  "function calculateFee(uint256 amount) external view returns (uint256)",
  "function isCardActive(string memory cardId) external view returns (bool)",
  "event CardCreated(string cardId, address indexed slotId, address indexed creator, address tokenAddress, uint256 tokenAmount, uint256 feePaid, string message, string encryptedPrivateKey, uint256 timestamp)",
  "event CardRedeemed(string cardId, address indexed slotId, address indexed to, address tokenAddress, uint256 amount, address indexed partner, uint256 timestamp)"
];

// Contract address (same on all networks)
const UNIVOUCHER_ADDRESS = '0x51553818203e38ce0E78e4dA05C07ac779ec5b58';

// Create contract instance
function getUniVoucherContract(providerOrSigner) {
  return new ethers.Contract(UNIVOUCHER_ADDRESS, UniVoucherABI, providerOrSigner);
}

// Reliable ethers.js loading for web applications
function loadEthers() {
    return new Promise((resolve, reject) => {
        if (typeof ethers !== 'undefined') {
            resolve(ethers);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/ethers@5.7.2/dist/ethers.umd.min.js';
        script.onload = () => {
            if (typeof ethers !== 'undefined') {
                resolve(ethers);
            } else {
                reject(new Error('Ethers.js failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load ethers.js'));
        document.head.appendChild(script);
    });
}
```

!!! tip "Smart Contract Details"
    For complete details on the smart contract logic and functions, see the [Smart Contract documentation](../technical/smart-contract.md).

---

### Step 2: Implement Cryptographic Helper Functions

These cryptographic functions handle the secure generation and management of card secrets. The implementation differs between browser and Node.js environments.

#### Browser Implementation (Web Crypto API)

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

// Encrypt a private key using PBKDF2 and AES-GCM (Browser)
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

// Decrypt an encrypted private key (Browser)
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

#### Node.js Implementation

```javascript
const crypto = require('crypto');

// Decrypt an encrypted private key (Node.js)
async function decryptPrivateKeyNodeJS(encryptedData, cardSecret) {
    try {
        // Parse the encrypted data JSON
        const data = JSON.parse(encryptedData);
        
        // Normalize the secret (remove hyphens)
        const normalizedSecret = cardSecret.replace(/-/g, '');
        
        // Convert hex strings to Buffers
        const salt = Buffer.from(data.salt, 'hex');
        const iv = Buffer.from(data.iv, 'hex');
        const ciphertext = Buffer.from(data.ciphertext, 'base64');
        
        // Derive key using PBKDF2 (same parameters as Web Crypto API)
        const key = crypto.pbkdf2Sync(normalizedSecret, salt, 310000, 32, 'sha256');
        
        // Handle AES-GCM decryption in Node.js
        const authTagLength = 16;
        
        if (ciphertext.length < authTagLength) {
            throw new Error('Invalid ciphertext length');
        }
        
        const authTag = ciphertext.slice(-authTagLength);
        const encryptedContent = ciphertext.slice(0, -authTagLength);
        
        // Use Node.js crypto API for AES-GCM
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt
        let decrypted = decipher.update(encryptedContent);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
        
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error("Invalid card secret");
    }
}
```

!!! tip "Signature Verification"
    For details on how card signatures are verified during redemption, see the [Signature Verification documentation](../technical/card-security.md#signature-verification).

---

### Step 3: Token Information Retrieval

Proper token display requires fetching actual token metadata from contracts rather than using default values.

```javascript
// Get token information (symbol and decimals) from contract
async function getTokenInfo(tokenAddress, chainId, provider) {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // Native token - get from chain info
        const chainInfo = await getChainInfo(chainId);
        return {
            symbol: chainInfo?.nativeCurrencySymbol || 'ETH',
            decimals: 18
        };
    } else {
        try {
            // ERC-20 ABI for symbol and decimals
            const erc20Abi = [
                'function symbol() view returns (string)',
                'function decimals() view returns (uint8)'
            ];
            
            const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
            
            // Get symbol and decimals with timeout
            const [symbol, decimals] = await Promise.race([
                Promise.all([contract.symbol(), contract.decimals()]),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                )
            ]);
            
            return { symbol, decimals };
            
        } catch (error) {
            console.warn('Failed to get token info:', error);
            // Fallback to generic values
            return { symbol: 'TOKEN', decimals: 18 };
        }
    }
}

// Format token amount using correct decimals
async function formatTokenAmount(amount, tokenAddress, chainId, provider) {
    try {
        const tokenInfo = await getTokenInfo(tokenAddress, chainId, provider);
        const formattedAmount = (parseFloat(amount) / Math.pow(10, tokenInfo.decimals));
        
        // Remove trailing zeros and unnecessary decimals
        const formatted = formattedAmount % 1 === 0 ? 
            formattedAmount.toString() : 
            formattedAmount.toFixed(6).replace(/\.?0+$/, '');
            
        return `${formatted} ${tokenInfo.symbol}`;
    } catch (error) {
        return `${amount} TOKEN`;
    }
}

// Get chain information from UniVoucher API
async function getChainInfo(chainId) {
    try {
        const response = await fetch('https://api.univoucher.com/v1/chains');
        const data = await response.json();
        return data.chains?.find(chain => chain.id === chainId);
    } catch (error) {
        console.error('Failed to fetch chain info:', error);
        return null;
    }
}
```

### Step 4: Implement Card Creation

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

### Step 5: Implement Card Redemption

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

// Alternative: Redeem with pre-generated signature (for gasless integrations)
async function redeemCardWithSignature(provider, cardId, signature, recipientAddress, partnerAddress = null) {
  try {
    const signer = provider.getSigner();
    const contract = getUniVoucherContract(signer);
    
    // Get card data to verify it's active
    const cardData = await contract.getCardData(cardId);
    if (!cardData[0]) {
      throw new Error("This card is not active");
    }
    
    // Execute redemption with provided signature
    const partner = partnerAddress || ethers.constants.AddressZero;
    const tx = await contract.redeemCard(cardId, recipientAddress, signature, partner);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      recipientAddress,
      partnerAddress
    };
  } catch (error) {
    console.error("Error redeeming card:", error);
    throw error;
  }
}
```

### Step 6: Implement Card Cancellation

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

### Step 7: Implement Card Data Retrieval

This function retrieves detailed information about a specific card from the blockchain. It formats the raw contract data into a more developer-friendly structure that can be easily used in applications.

```javascript
// Get card details from smart contract
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

// Get card details from UniVoucher API (alternative method)
async function getCardDetailsFromAPI(cardId) {
  try {
    const response = await fetch(`https://api.univoucher.com/v1/cards/single?id=${cardId}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Card not found');
      }
      if (response.status === 400) {
        throw new Error('Invalid card ID format');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching card from API:", error);
    throw error;
  }
}

// Format card data for display with proper token information
async function formatCardDataForDisplay(cardData, provider) {
  const tokenInfo = await getTokenInfo(cardData.tokenAddress, cardData.chainId, provider);
  const formattedAmount = await formatTokenAmount(
    cardData.tokenAmount, 
    cardData.tokenAddress, 
    cardData.chainId, 
    provider
  );
  
  return {
    ...cardData,
    formattedAmount,
    tokenSymbol: tokenInfo.symbol,
    statusText: cardData.active ? 'Active' : 
               cardData.redeemedBy ? 'Redeemed' : 'Cancelled'
  };
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


## API Integration Examples

### Using UniVoucher API for Card Data

```javascript
// Check card status without blockchain interaction
async function checkCardStatus(cardId) {
  try {
    const response = await fetch(`https://api.univoucher.com/v1/cards/single?id=${cardId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const cardData = await response.json();
    return {
      exists: true,
      active: cardData.active,
      status: cardData.status,
      chainId: cardData.chainId,
      tokenAddress: cardData.tokenAddress,
      tokenAmount: cardData.tokenAmount
    };
  } catch (error) {
    if (error.message.includes('404')) {
      return { exists: false };
    }
    throw error;
  }
}

// Get supported chains
async function getSupportedChains() {
  try {
    const response = await fetch('https://api.univoucher.com/v1/chains');
    const data = await response.json();
    return data.chains;
  } catch (error) {
    console.error('Failed to fetch supported chains:', error);
    return [];
  }
}

// Get current fees for a chain
async function getChainFees(chainId) {
  try {
    const response = await fetch(`https://api.univoucher.com/v1/fees?chainId=${chainId}`);
    const data = await response.json();
    return data.feePercentage;
  } catch (error) {
    console.error('Failed to fetch chain fees:', error);
    return null;
  }
}
```