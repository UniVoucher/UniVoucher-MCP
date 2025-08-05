openapi: 3.0.3
info:
  title: UniVoucher API
  description: >
    <p>UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains.</p>
    <p><b>This API is completely free and public to use</b> - no API key required! With a single version, you can directly integrate with our endpoints without any registration or authentication process.</p>
    <p>This API provides both <b>read-only</b> endpoints for querying the UniVoucher ecosystem and <b>write</b> endpoints for creating gift cards. You can use it to retrieve details about gift cards, query cards associated with specific addresses or blockchains, check current protocol fees, and create new gift cards.</p>
    <p>For card redemption, you must interact directly with the UniVoucher smart contract. Please refer to our <a target="_blank" href="https://docs.univoucher.com/developers/integration-guide/">Integration Guide</a> for guidance.</p>
    <p>As a decentralized application, UniVoucher stores all gift card data securely on the blockchain. This API is designed to index the blockchain data and provide a way to query and create cards. Gift cards are generated with secure cryptographic methods and user-friendly secrets.</p>
    <p>Full API specification: <a target="_blank" href="https://api.univoucher.com/openapi.yaml">openapi.yaml</a></p>
    <p>UniVoucher Support: <a target="_blank" href="https://t.me/UniVoucherOfficial">Telegram Group</a></p>
  version: 1.0.0
servers:
  - url: https://api.univoucher.com/v1
    description: Production API Server
tags:
  - name: General
    description: General API information and health endpoints
  - name: Cards
    description: Card-related endpoints for gift card management
  - name: Fees
    description: Fee-related endpoints for protocol fee management
  - name: Chains
    description: Chain-related endpoints for blockchain information
  - name: Callbacks
    description: Callback notification documentation and examples

paths:
  /health:
    get:
      summary: Health Check
      description: Checks if the API is running properly and database is connected
      tags:
        - General
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
                  message:
                    type: string
                    example: Service is healthy
        '503':
          description: Service is unhealthy (database disconnected)
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: error
                  message:
                    type: string
                    example: Database unavailable
  
  /:
    get:
      summary: API Information
      description: Returns API documentation and available endpoints
      tags:
        - General
      responses:
        '200':
          description: API information
          content:
            application/json:
              schema:
                type: object
                properties:
                  name:
                    type: string
                    example: UniVoucher API v1
                  version:
                    type: string
                    example: 1.0.0
                  description:
                    type: string
                  endpoints:
                    type: object
                    properties:
                      /cards:
                        type: string
                        example: Card-related endpoints
                      /fees:
                        type: string
                        example: Fee-related endpoints
                      /chains:
                        type: string
                        example: Chain-related endpoints
                      /admin:
                        type: string
                        example: Admin endpoints



  /cards/all:
    get:
      summary: Get All Cards
      description: >
        <h3>Overview</h3>
        <p>This endpoint retrieves cards with flexible filtering options and provides comprehensive statistics.</p>
        
        <h3>Statistics Only Mode</h3>
        <p>Setting limit=0 returns only statistics without card data:</p>
        <pre>
        GET /cards/all?creator=0x123&chain=56&limit=0
        
        {
          "total": 250,
          "active": 150,
          "redeemed": 80,
          "cancelled": 20
        }
        </pre>
        <p>This is useful for dashboards or when you only need counts.</p>
        
        <h3>The belongTo Parameter</h3>
        <p>The belongTo parameter enables retrieving all cards associated with an address (as either creator or redeemer) in a single query.</p>
        
        <h4>Usage Scenarios:</h4>
        <ul>
          <li><strong>Basic usage:</strong> /cards/all?belongTo=0x123<br>
              Returns all cards where creator=0x123 <em>OR</em> redeemedBy=0x123</li>
              
          <li><strong>With creator:</strong> /cards/all?belongTo=0x123&creator=0x456<br>
              Returns cards where creator=0x456 <em>AND</em> redeemedBy=0x123</li>
              
          <li><strong>With redeemedBy:</strong> /cards/all?belongTo=0x123&redeemedBy=0x456<br>
              Returns cards where creator=0x123 <em>AND</em> redeemedBy=0x456</li>
              
          <li><strong>With both:</strong> /cards/all?belongTo=0x123&creator=0x456&redeemedBy=0x789<br>
              Returns cards where creator=0x456 <em>AND</em> redeemedBy=0x789 (ignoring belongTo)</li>
        </ul>
        
        <p><strong>Note:</strong> When both belongTo and specific filters (creator/redeemedBy) are provided, 
        the explicit filters take precedence over the corresponding parts of belongTo.</p>
        
        <h3>Common Use Cases</h3>
        <ul>
          <li>Wallet integration: /cards/all?belongTo={userAddress} to show all cards a user has created or received</li>
          <li>Gift tracking: /cards/all?creator={userAddress}&status=active to show unredeemed gifts sent</li>
          <li>Portfolio view: /cards/all?redeemedBy={userAddress} to show received gifts</li>
        </ul>
      tags:
        - Cards
      parameters:
        - name: page
          in: query
          description: Page number for pagination
          required: false
          schema:
            type: integer
            default: 1
            minimum: 1
        - name: limit
          in: query
          description: Results per page. Set to 0 for stats only.
          required: false
          schema:
            type: integer
            default: 20
            minimum: 0
        - name: status
          in: query
          description: Filter by card status
          required: false
          schema:
            type: string
            enum: [active, redeemed, cancelled]
        - name: chain
          in: query
          description: Filter by chain ID
          required: false
          schema:
            type: integer
        - name: creator
          in: query
          description: Filter by creator address
          required: false
          schema:
            type: string
        - name: redeemedBy
          in: query
          description: Filter by redeemer address
          required: false
          schema:
            type: string
        - name: partner
          in: query
          description: Filter by partner address used during redemption
          required: false
          schema:
            type: string
        - name: belongTo
          in: query
          description: Filter to cards created by OR redeemed by this address. If creator or redeemedBy are also specified, they take precedence over the corresponding parts of belongTo.
          required: false
          schema:
            type: string    
        - name: tokenAddress
          in: query
          description: Filter by token address (use 0x0000000000000000000000000000000000000000 for native currency)
          required: false
          schema:
            type: string
        - name: sortDirection
          in: query
          description: Sort direction for results based on creation date
          required: false
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        '200':
          description: List of cards matching criteria with statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  total:
                    type: integer
                    description: Total number of cards matching criteria
                    example: 250
                  active:
                    type: integer
                    description: Number of active cards
                    example: 150
                  redeemed:
                    type: integer
                    description: Number of redeemed cards
                    example: 80
                  cancelled:
                    type: integer
                    description: Number of cancelled cards
                    example: 20
                  page:
                    type: integer
                    description: Current page number
                    example: 1
                  limit:
                    type: integer
                    description: Results per page
                    example: 20
                  totalPages:
                    type: integer
                    description: Total number of pages
                    example: 13
                  cards:
                    type: array
                    items:
                      $ref: '#/components/schemas/Card'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /cards/single:
    get:
      summary: Get Single Card
      description: Get a single card by ID or slot ID
      tags:
        - Cards
      parameters:
        - name: id
          in: query
          description: Card ID to look up (mutually exclusive with slotId)
          required: false
          schema:
            type: integer
        - name: slotId
          in: query
          description: Slot ID to look up (mutually exclusive with id)
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Card details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '400':
          description: Bad request - Missing required parameters
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Either id or slotId parameter is required
        '404':
          description: Card not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Card not found
        '500':
          $ref: '#/components/responses/InternalServerError'

  /cards/create:
    post:
      summary: Create Gift Cards
      description: >
        <p>Create new UniVoucher gift cards on the blockchain using your own crypto wallet private key. this wallet must have enough balance to cover the gas fees (UniVoucher never store your private key). You can choose to receive notifications via callback URL or get the card details directly in the response after processing. This endpoint handles both single and bulk card creation.</p>
        
        <h3>Security Features</h3>
        <ul>
          <li><strong>Private Key Encryption:</strong> Card private keys are encrypted using PBKDF2 and AES-GCM</li>
          <li><strong>Friendly Secrets:</strong> User-friendly card secrets in format XXXXX-XXXXX-XXXXX-XXXXX</li>
          <li><strong>Balance Validation:</strong> Automatic balance checking before transaction</li>
          <li><strong>Callback Notifications:</strong> Optional webhook notifications for order status</li>
        </ul>
        
        <h3>Supported Networks</h3>
        <ul>
          <li>1 - Ethereum</li>
          <li>8453 - Base</li>
          <li>56 - BNB Chain</li>
          <li>137 - Polygon</li>
          <li>42161 - Arbitrum</li>
          <li>10 - Optimism</li>
          <li>43114 - Avalanche</li>
        </ul>
        
        <h3>Token Support</h3>
        <ul>
          <li><strong>Native Tokens:</strong> Use zero address (0x0000000000000000000000000000000000000000)</li>
          <li><strong>ERC-20 Tokens:</strong> Any ERC-20 token address</li>
        </ul>
        
        <h3>Fee Structure</h3>
        <p>Protocol fee is paid in the same token as the card.</p>
        
        <h3>ERC-20 Token Approval</h3>
        <p>For ERC-20 tokens, the API automatically approves unlimited allowance (MaxUint256) to the UniVoucher contract. This eliminates the need for multiple approval transactions and ensures smooth bulk card creation.</p>
        
        <h3>Bulk Creation</h3>
        <p>For quantities > 1, cards are created using the UniVoucher contract's bulk functions:</p>
        <ul>
          <li><strong>Single Card (quantity = 1):</strong> Uses <code>depositETH</code> or <code>depositERC20</code></li>
          <li><strong>Multiple Cards (quantity > 1):</strong> Uses <code>bulkDepositETH</code> or <code>bulkDepositERC20</code></li>
        </ul>
        <p>Bulk creation is more gas-efficient as it creates all cards in a single transaction. Each card gets a unique secret.</p>
        
        <h3>Request Processing Modes</h3>
        <p>The API supports two modes of operation:</p>
        
        <h4>1. Callback Mode (Asynchronous)</h4>
        <p>When <code>callbackUrl</code> is provided, the API operates asynchronously:</p>
        <ul>
          <li><strong>Immediate Response:</strong> Returns 202 Accepted with pending status</li>
          <li><strong>Background Processing:</strong> Processes transactions in the background</li>
          <li><strong>Callback Notification:</strong> Sends POST request to callback URL with results</li>
          <li><strong>Use Case:</strong> Web applications, mobile apps, or any scenario requiring non-blocking operation</li>
        </ul>
        
        <h4>2. Direct Response Mode (Synchronous)</h4>
        <p>When <code>callbackUrl</code> is not provided, the API operates synchronously:</p>
        <ul>
          <li><strong>Blocking Response:</strong> Waits for transaction completion</li>
          <li><strong>Direct Return:</strong> Returns card details directly in the response</li>
          <li><strong>No Callback:</strong> No webhook notifications sent</li>
          <li><strong>Use Case:</strong> Command-line tools, scripts, or when immediate results are needed</li>
        </ul>
        
        <h3>Request Processing Flow</h3>
        <p>The card creation process follows a specific flow with immediate validation and processing:</p>
        
        <h4>1. Immediate Validation (Synchronous)</h4>
        <p>Before returning any response, the API performs comprehensive validation:</p>
        <ul>
          <li><strong>Parameter Validation:</strong> Checks all required fields are present and valid</li>
          <li><strong>Network Validation:</strong> Verifies the network is supported</li>
          <li><strong>Token Address Validation:</strong> Validates ERC-20 token address format</li>
          <li><strong>Amount Validation:</strong> Ensures amount is positive and valid</li>
          <li><strong>Private Key Validation:</strong> Validates private key format</li>
          <li><strong>Callback URL Validation:</strong> Validates URL format</li>
          <li><strong>Quantity Validation:</strong> Ensures quantity is between 1-100</li>
        </ul>
        
        <h4>2. Balance & Gas Estimation (Synchronous)</h4>
        <p>After validation, the API performs financial checks:</p>
        <ul>
          <li><strong>Fee Calculation:</strong> Calculates protocol fee using smart contract</li>
          <li><strong>Gas Price Estimation:</strong> Gets optimal gas price from Alchemy API</li>
          <li><strong>Gas Limit Estimation:</strong> Estimates gas needed for transaction</li>
          <li><strong>Balance Validation:</strong> Checks if wallet has sufficient funds</li>
          <li><strong>Token Balance Check:</strong> For ERC-20 tokens, checks token balance</li>
          <li><strong>Native Balance Check:</strong> Ensures enough native tokens for gas fees</li>
        </ul>
        
        <h4>3. Pending Status Response</h4>
        <p>If all validations pass, the API immediately returns a 202 Accepted response with pending status:</p>
        <ul>
          <li><strong>Immediate Response:</strong> No waiting for blockchain transactions</li>
          <li><strong>Status:</strong> "pending" - indicates processing has started</li>
          <li><strong>Order Tracking:</strong> Includes orderId for tracking</li>
          <li><strong>Fee Information:</strong> Shows calculated fees and amounts</li>
          <li><strong>Callback Promise:</strong> Assures callback will be sent</li>
        </ul>
        
        <h4>4. Asynchronous Processing</h4>
        <p>After returning the pending response, the API processes transactions asynchronously:</p>
        <ul>
          <li><strong>Approval Transaction:</strong> For ERC-20 tokens, approves unlimited allowance</li>
          <li><strong>Creation Transaction:</strong> Creates cards on the blockchain</li>
          <li><strong>Event Processing:</strong> Waits for CardCreated events</li>
          <li><strong>Callback Notification:</strong> Sends success/error callback</li>
        </ul>
        
        <h3>Pending Status Response</h3>
        <p>The pending response includes all the information needed to track the order:</p>
        <pre>
        {
          "success": true,
          "status": "pending",
          "orderId": "order_12345",
          "issuerAddress": "0x1234567890abcdef1234567890abcdef12345678",
          "network": 8453,
          "tokenAddress": "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
          "amountPerCard": "1000000000000000000",
          "feePerCard": "50000000000000000",
          "totalPerCard": "1050000000000000000",
          "quantity": 1,
          "totalAmount": "1050000000000000000",
          "message": "Happy Birthday!",
          "callbackUrl": "https://your-app.com/webhook",
          "createdAt": "2025-01-15T10:30:00.000Z"
        }
        </pre>
        
        <h3>What Happens After Pending Status</h3>
        <ol>
          <li><strong>Approval Transaction (ERC-20 only):</strong>
            <ul>
              <li>Checks current token allowance</li>
              <li>If insufficient, sends approval transaction</li>
              <li>Waits for approval confirmation (30-minute timeout)</li>
              <li>Records approval transaction hash</li>
            </ul>
          </li>
          <li><strong>Card Creation Transaction:</strong>
            <ul>
              <li>Generates random wallet for each card</li>
              <li>Creates friendly secret (XXXXX-XXXXX-XXXXX-XXXXX)</li>
              <li>Encrypts card private key with friendly secret</li>
              <li>Sends creation transaction to blockchain</li>
              <li>Waits for transaction confirmation (30-minute timeout)</li>
              <li>Records creation transaction hash</li>
            </ul>
          </li>
          <li><strong>Event Processing:</strong>
            <ul>
              <li>Listens for CardCreated events</li>
              <li>Extracts card IDs and slot IDs</li>
              <li>Maps cards to friendly secrets</li>
              <li>Prepares card details for callback</li>
            </ul>
          </li>
          <li><strong>Callback Notification:</strong>
            <ul>
              <li>Sends POST request to callback URL</li>
              <li>Includes all card details and transaction hashes</li>
              <li>Retries up to 3 times if delivery fails</li>
            </ul>
          </li>
        </ol>
        
        <h3>Processing Timeline</h3>
        <pre>
        ┌─────────────────────────────────────────────────────────────────┐
        │                    CARD CREATION FLOW                         │
        ├─────────────────────────────────────────────────────────────────┤
        │                                                               │
        │  1. REQUEST SUBMISSION                                        │
        │     └─ POST /cards/create                                     │
        │                                                               │
        │  2. IMMEDIATE VALIDATION (Synchronous)                       │
        │     ├─ Parameter validation                                   │
        │     ├─ Network validation                                     │
        │     ├─ Balance checks                                         │
        │     ├─ Gas estimation                                         │
        │     └─ Financial validation                                   │
        │                                                               │
        │  3. PENDING RESPONSE (202 Accepted)                          │
        │     ├─ Status: "pending"                                      │
        │     ├─ OrderId for tracking                                   │
        │     ├─ Fee breakdown                                          │
        │     └─ Promise of callback                                    │
        │                                                               │
        │  4. ASYNCHRONOUS PROCESSING                                   │
        │     ├─ Approval transaction (ERC-20 only)                     │
        │     │   ├─ Check allowance                                    │
        │     │   ├─ Send approval tx                                   │
        │     │   └─ Wait confirmation (30min timeout)                  │
        │     │                                                         │
        │     ├─ Creation transaction                                   │
        │     │   ├─ Generate card wallets                              │
        │     │   ├─ Create friendly secrets                            │
        │     │   ├─ Encrypt private keys                               │
        │     │   ├─ Send creation tx                                   │
        │     │   └─ Wait confirmation (30min timeout)                  │
        │     │                                                         │
        │     ├─ Event processing                                       │
        │     │   ├─ Listen for CardCreated events                      │
        │     │   ├─ Extract card IDs                                   │
        │     │   └─ Map to secrets                                     │
        │     │                                                         │
        │     └─ Callback notification                                  │
        │         ├─ Send success/error callback                        │
        │         ├─ Include transaction hashes                         │
        │         └─ Retry on failure (3 attempts)                     │
        │                                                               │
        └─────────────────────────────────────────────────────────────────┘
        </pre>
        
        <h3>Error Scenarios During Processing</h3>
        <ul>
          <li><strong>Approval Timeout:</strong> 30-minute timeout for approval transaction</li>
          <li><strong>Creation Timeout:</strong> 30-minute timeout for creation transaction</li>
          <li><strong>Insufficient Funds:</strong> Transaction fails due to low balance</li>
          <li><strong>Network Congestion:</strong> High gas prices or network issues</li>
          <li><strong>Contract Errors:</strong> Smart contract validation failures</li>
          <li><strong>Callback Failures:</strong> Webhook delivery issues (retried automatically)</li>
        </ul>
        
        <h3>Callback Notifications</h3>
        <p>The API sends POST requests to your callback URL with detailed transaction information. Callbacks include transaction hashes for both approval and creation transactions.</p>
        
        <h4>Success Callback</h4>
        <p>Sent when card creation is successful:</p>
        <pre>
        POST {callbackUrl}
        Content-Type: application/json
        
        {
          "orderId": "order_12345",
          "status": "success",
          "issuerAddress": "0x1234567890abcdef1234567890abcdef12345678",
          "network": 8453,
          "tokenAddress": "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
          "amountPerCard": "1000000000000000000",
          "feePerCard": "50000000000000000",
          "totalPerCard": "1050000000000000000",
          "quantity": 1,
          "totalAmount": "1050000000000000000",
          "cards": [
            {
              "cardId": 1026123,
              "cardSecret": "ABCDE-FGHIJ-KLMNO-PQRST",
              "slotId": "0xabcdef1234567890abcdef1234567890abcdef12",
              "amount": "1000000000000000000",
              "tokenAddress": "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
              "message": "Happy Birthday!",
              "orderId": "order_12345"
            }
          ],
          "approvalTransactionHashes": ["0x1234..."],
          "creationTransactionHashes": ["0x5678..."],
          "message": "Happy Birthday!",
          "authToken": "your-auth-token"
        }
        </pre>
        <p><strong>Note:</strong> The <code>message</code> field in the success callback contains the message that was attached to the gift cards, not a status message.</p>
        
        <h4>Error Callback</h4>
        <p>Sent when card creation fails:</p>
        <pre>
        POST {callbackUrl}
        Content-Type: application/json
        
        {
          "orderId": "order_12345",
          "status": "error",
          "error": "insufficient funds for intrinsic transaction cost",
          "approvalTransactionHashes": ["0x1234..."],
          "creationTransactionHashes": [],
          "authToken": "your-auth-token"
        }
        </pre>
        
        <h4>Callback Retry Logic</h4>
        <ul>
          <li><strong>Retry Attempts:</strong> 3 attempts with exponential backoff</li>
          <li><strong>Retry Delays:</strong> 1s, 5s, 15s</li>
          <li><strong>Timeout:</strong> 10 seconds per attempt</li>
          <li><strong>Headers:</strong> Includes User-Agent and timestamp headers</li>
        </ul>
        
        <h4>Transaction Hash Tracking</h4>
        <ul>
          <li><strong>approvalTransactionHashes:</strong> Array of approval transaction hashes (if ERC-20 token)</li>
          <li><strong>creationTransactionHashes:</strong> Array of card creation transaction hashes</li>
          <li><strong>Empty Arrays:</strong> Indicates no transactions were completed</li>
        </ul>
      tags:
        - Cards
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - network
                - tokenAddress
                - amount
                - privateKey
                - orderId
              properties:
                network:
                  type: integer
                  description: Chain ID for the network
                  example: 1
                tokenAddress:
                  type: string
                  description: Token address (use zero address for native tokens)
                  example: "0x0000000000000000000000000000000000000000"
                amount:
                  type: string
                  description: Amount in wei (as string to handle large numbers)
                  example: "1000000000000000000"
                quantity:
                  type: integer
                  description: Number of cards to create (1-100)
                  minimum: 1
                  maximum: 100
                  default: 1
                  example: 1
                privateKey:
                  type: string
                  description: Issuer's private key (with or without 0x prefix)
                  example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                orderId:
                  type: string
                  description: Order ID for user reference
                  example: "order_12345"
                callbackUrl:
                  type: string
                  format: uri
                  description: Callback URL for notifications (optional - if not provided, card details will be returned in response after processing)
                  example: "https://your-app.com/webhook"
                authToken:
                  type: string
                  description: Authentication token for callback verification (optional - required if callbackUrl is provided)
                  example: "your-auth-token-123"
                message:
                  type: string
                  description: Optional message to attach to cards
                  maxLength: 100
                  example: "Happy Birthday!"

      responses:
        '202':
          description: Card creation initiated (pending) - Callback mode only
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  status:
                    type: string
                    example: "pending"
                  orderId:
                    type: string
                    example: "order_12345"
                  issuerAddress:
                    type: string
                    example: "0x1234567890abcdef1234567890abcdef12345678"
                  network:
                    type: integer
                    example: 1
                  tokenAddress:
                    type: string
                    example: "0x0000000000000000000000000000000000000000"
                  amountPerCard:
                    type: string
                    example: "1000000000000000000"
                  feePerCard:
                    type: string
                    example: "10000000000000000"
                  totalPerCard:
                    type: string
                    example: "1010000000000000000"
                  quantity:
                    type: integer
                    example: 1
                  totalAmount:
                    type: string
                    example: "1010000000000000000"
                  message:
                    type: string
                    description: The message attached to the gift cards (same as request message)
                    example: "Happy Birthday!"
                  callbackUrl:
                    type: string
                    example: "https://your-app.com/webhook"
                  createdAt:
                    type: string
                    format: date-time
                    example: "2025-01-15T10:30:00.000Z"
        '200':
          description: Card creation completed successfully - Direct response mode only
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  status:
                    type: string
                    example: "success"
                  orderId:
                    type: string
                    example: "order_12345"
                  issuerAddress:
                    type: string
                    example: "0x1234567890abcdef1234567890abcdef12345678"
                  network:
                    type: integer
                    example: 1
                  tokenAddress:
                    type: string
                    example: "0x0000000000000000000000000000000000000000"
                  amountPerCard:
                    type: string
                    example: "1000000000000000000"
                  feePerCard:
                    type: string
                    example: "10000000000000000"
                  totalPerCard:
                    type: string
                    example: "1010000000000000000"
                  quantity:
                    type: integer
                    example: 1
                  totalAmount:
                    type: string
                    example: "1010000000000000000"
                  cards:
                    type: array
                    items:
                      type: object
                      properties:
                        cardId:
                          type: integer
                          example: 1026123
                        cardSecret:
                          type: string
                          example: "ABCDE-FGHIJ-KLMNO-PQRST"
                        slotId:
                          type: string
                          example: "0xabcdef1234567890abcdef1234567890abcdef12"
                        amount:
                          type: string
                          example: "1000000000000000000"
                        tokenAddress:
                          type: string
                          example: "0x0000000000000000000000000000000000000000"
                        message:
                          type: string
                          example: "Happy Birthday!"
                        orderId:
                          type: string
                          example: "order_12345"
                  approvalTransactionHashes:
                    type: array
                    items:
                      type: string
                    example: ["0x1234..."]
                  creationTransactionHashes:
                    type: array
                    items:
                      type: string
                    example: ["0x5678..."]
                  message:
                    type: string
                    description: The message attached to the gift cards (same as request message)
                    example: "Happy Birthday!"
                  createdAt:
                    type: string
                    format: date-time
                    example: "2025-01-15T10:30:00.000Z"
        '400':
          description: Bad request - Validation or balance error
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Missing required parameters"
                      required:
                        type: array
                        items:
                          type: string
                        example: ["network", "tokenAddress", "amount", "privateKey", "orderId"]
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Invalid private key format"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Invalid network"
                      supportedNetworks:
                        type: array
                        items:
                          type: integer
                        example: [1, 8453, 56, 137, 42161, 10, 43114]
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Invalid token address"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Invalid amount format"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Quantity must be between 1 and 100"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Invalid callback URL"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Insufficient balance"
                      required:
                        type: string
                        example: "1015000000000000000"
                      available:
                        type: string
                        example: "1000000000000000000"
                      breakdown:
                        type: object
                        properties:
                          cardAmount:
                            type: string
                            example: "1010000000000000000"
                          gasCost:
                            type: string
                            example: "50000000000000000"
                          gasPrice:
                            type: string
                            example: "20000000000"
                          gasLimit:
                            type: string
                            example: "2500000"
                      tokenAddress:
                        type: string
                        example: "0x0000000000000000000000000000000000000000"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Insufficient token balance"
                      required:
                        type: string
                        example: "1010000000000000000"
                      available:
                        type: string
                        example: "1000000000000000000"
                      tokenAddress:
                        type: string
                        example: "0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C"
                  - type: object
                    properties:
                      error:
                        type: string
                        example: "Insufficient native balance for gas fees"
                      required:
                        type: string
                        example: "50000000000000000"
                      available:
                        type: string
                        example: "10000000000000000"
                      breakdown:
                        type: object
                        properties:
                          gasCost:
                            type: string
                            example: "50000000000000000"
                          gasPrice:
                            type: string
                            example: "20000000000"
                          gasLimit:
                            type: string
                            example: "2500000"
        '500':
          $ref: '#/components/responses/InternalServerError'

  /callbacks:
    get:
      summary: Callback Documentation
      description: >
        <h3>Callback Notification System</h3>
        <p>UniVoucher API uses webhook callbacks to notify your application about the status of card creation requests. This system provides real-time updates and includes detailed transaction information.</p>
        
        <h3>Request Processing & Pending Status</h3>
        <p>When you submit a card creation request, the API follows this flow:</p>
        
        <h4>1. Immediate Processing (Synchronous)</h4>
        <p>The API performs comprehensive validation and checks before any response:</p>
        <ul>
          <li><strong>Input Validation:</strong> Validates all parameters, network, token address, amounts</li>
          <li><strong>Balance Checks:</strong> Verifies sufficient funds for card amount + fees + gas</li>
          <li><strong>Gas Estimation:</strong> Calculates optimal gas price and estimated gas limit</li>
          <li><strong>Financial Validation:</strong> Ensures total cost doesn't exceed available balance</li>
        </ul>
        
        <h4>2. Pending Status Response (202 Accepted)</h4>
        <p>If all validations pass, the API immediately returns:</p>
        <ul>
          <li><strong>Status Code:</strong> 202 Accepted (not 200 OK)</li>
          <li><strong>Status Field:</strong> "pending" (not "success")</li>
          <li><strong>Immediate Response:</strong> No waiting for blockchain transactions</li>
          <li><strong>Order Tracking:</strong> Includes orderId for future reference</li>
          <li><strong>Fee Breakdown:</strong> Shows calculated fees and total amounts</li>
        </ul>
        
        <h4>3. Asynchronous Processing</h4>
        <p>After the pending response, processing continues in the background:</p>
        <ul>
          <li><strong>Approval Transaction:</strong> For ERC-20 tokens, approves unlimited allowance</li>
          <li><strong>Creation Transaction:</strong> Creates cards on the blockchain</li>
          <li><strong>Event Processing:</strong> Waits for CardCreated events</li>
          <li><strong>Callback Notification:</strong> Sends final result via webhook</li>
        </ul>
        
        <h3>Callback Flow</h3>
        <ol>
          <li><strong>Request Submission:</strong> You submit a card creation request</li>
          <li><strong>Immediate Response:</strong> API returns 202 Accepted with pending status</li>
          <li><strong>Transaction Processing:</strong> API processes approval and creation transactions</li>
          <li><strong>Callback Notification:</strong> API sends POST request to your callback URL</li>
        </ol>
        
        <h3>Callback Scenarios</h3>
        
        <h4>1. Successful Card Creation</h4>
        <p><strong>When:</strong> All transactions succeed (approval + creation)</p>
        <p><strong>Status:</strong> "success"</p>
        <p><strong>Includes:</strong> Card details, secrets, transaction hashes</p>
        
        <h4>2. Approval Success, Creation Failure</h4>
        <p><strong>When:</strong> Approval succeeds but creation fails</p>
        <p><strong>Status:</strong> "error"</p>
        <p><strong>Includes:</strong> Approval transaction hash, creation error</p>
        
        <h4>3. Approval Failure</h4>
        <p><strong>When:</strong> Approval transaction fails</p>
        <p><strong>Status:</strong> "error"</p>
        <p><strong>Includes:</strong> Error message, no transaction hashes</p>
        
        <h4>4. Network/System Errors</h4>
        <p><strong>When:</strong> System errors, network issues, timeouts</p>
        <p><strong>Status:</strong> "error"</p>
        <p><strong>Includes:</strong> Error message, partial transaction hashes if any</p>
        
        <h3>Callback Headers</h3>
        <pre>
        Content-Type: application/json
        User-Agent: UniVoucher-API/1.0.0
        X-UniVoucher-Timestamp: 1703123456789
        </pre>
        
        <h3>Response Codes</h3>
        <ul>
          <li><strong>200 OK:</strong> Callback received successfully</li>
          <li><strong>4xx/5xx:</strong> Callback will be retried</li>
        </ul>
        
        <h3>Security Considerations</h3>
        <ul>
          <li><strong>Auth Token:</strong> Verify authToken matches your original request</li>
          <li><strong>Order ID:</strong> Verify orderId matches your original request</li>
          <li><strong>HTTPS:</strong> Use HTTPS for callback URLs in production</li>
          <li><strong>Validation:</strong> Validate all callback data before processing</li>
        </ul>
        
        <h3>Error Handling</h3>
        <ul>
          <li><strong>Retry Logic:</strong> 3 attempts with exponential backoff</li>
          <li><strong>Timeout:</strong> 10 seconds per attempt</li>
          <li><strong>Failure:</strong> Logged but doesn't affect card creation</li>
          <li><strong>Monitoring:</strong> Monitor callback delivery in production</li>
        </ul>
      tags:
        - Callbacks
      responses:
        '200':
          description: Callback documentation
          content:
            application/json:
              schema:
                type: object
                properties:
                  title:
                    type: string
                    example: "UniVoucher Callback Documentation"
                  description:
                    type: string
                    example: "Complete guide to callback notifications"
                  scenarios:
                    type: object
                    properties:
                      success:
                        type: string
                        example: "Card creation successful"
                      approval_success_creation_failure:
                        type: string
                        example: "Approval succeeded but creation failed"
                      approval_failure:
                        type: string
                        example: "Approval transaction failed"
                      system_error:
                        type: string
                        example: "Network or system error"
                  retry_logic:
                    type: object
                    properties:
                      attempts:
                        type: integer
                        example: 3
                      delays:
                        type: array
                        items:
                          type: integer
                        example: [1000, 5000, 15000]
                      timeout:
                        type: integer
                        example: 10000
                  security:
                    type: array
                    items:
                      type: string
                    example: ["Verify authToken", "Verify orderId", "Use HTTPS", "Validate data"]

  

  

  
  /fees/current:
    get:
      summary: Get Current Fees
      description: Get current fee percentages for all chains or a specific chain
      tags:
        - Fees
      parameters:
        - name: chainId
          in: query
          description: Chain ID to filter by
          required: false
          schema:
            type: integer
      responses:
        '200':
          description: Current fee percentages
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    description: Fees for all chains
                    additionalProperties:
                      type: number
                      format: float
                    example:
                      "1": 0.01
                      "8453": 0.01
                      "56": 0.01
                  - type: object
                    description: Fee for specific chain
                    properties:
                      feePercentage:
                        type: number
                        format: float
                        example: 0.01
        '404':
          description: Chain not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Chain not found or inactive
        '500':
          $ref: '#/components/responses/InternalServerError'

  /fees/history/{chainId}:
    get:
      summary: Get Fee History
      description: Get fee update history for a chain
      tags:
        - Fees
      parameters:
        - name: chainId
          in: path
          description: Chain ID
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Fee update history
          content:
            application/json:
              schema:
                type: object
                properties:
                  chainId:
                    type: integer
                    example: 1
                  chainName:
                    type: string
                    example: Ethereum
                  currentFeePercentage:
                    type: number
                    format: float
                    example: 0.01
                  currentFeeBasisPoints:
                    type: integer
                    example: 100
                  history:
                    type: array
                    items:
                      type: object
                      properties:
                        oldFeePercentage:
                          type: number
                          format: float
                          example: 0.005
                        newFeePercentage:
                          type: number
                          format: float
                          example: 0.01
                        oldFeeBasisPoints:
                          type: integer
                          example: 50
                        newFeeBasisPoints:
                          type: integer
                          example: 100
                        timestamp:
                          type: string
                          format: date-time
                          example: "2025-04-15T10:23:45.000Z"
                        transactionHash:
                          type: string
                          example: "0xabcdef..."
        '404':
          description: Chain not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Chain not found
        '500':
          $ref: '#/components/responses/InternalServerError'
  
  /chains:
    get:
      summary: Get Chains
      description: Get all chains or details for a specific chain
      tags:
        - Chains
      parameters:
        - name: chain
          in: query
          description: Chain ID to filter by
          required: false
          schema:
            type: integer
      responses:
        '200':
          description: Chain information
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    description: All chains
                    properties:
                      chains:
                        type: array
                        items:
                          $ref: '#/components/schemas/Chain'
                  - type: object
                    description: Specific chain
                    $ref: '#/components/schemas/Chain'
        '404':
          description: Chain not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Chain not found
        '500':
          $ref: '#/components/responses/InternalServerError'
  


components:
  schemas:
    Card:
      type: object
      properties:
        cardId:
          type: integer
          description: Unique identifier for the card
          example: 1026123
        slotId:
          type: string
          description: Address/public key of the card
          example: "0xabcdef1234567890abcdef1234567890abcdef12"
        chainId:
          type: integer
          description: Blockchain chain ID
          example: 1
        chainName:
          type: string
          description: Name of the blockchain
          example: "Ethereum"
        active:
          type: boolean
          description: Whether the card is active
          example: true
        status:
          type: string
          description: Status of the card
          enum: [active, redeemed, cancelled]
          example: "active"
        tokenAddress:
          type: string
          description: Address of the token (address(0) for native currency)
          example: "0x0000000000000000000000000000000000000000"
        tokenAmount:
          type: string
          description: Amount of tokens stored (as string to handle large numbers)
          example: "1000000000000000000"
        creator:
          type: string
          description: Address of the card creator
          example: "0x1234567890abcdef1234567890abcdef12345678"
        message:
          type: string
          description: Optional message attached to the card
          example: "Happy Birthday!"
        encryptedPrivateKey:
          type: string
          description: Encrypted private key (optional)
        feePaid:
          type: string
          description: Fee paid when creating the card
          example: "10000000000000000"
        createdAt:
          type: string
          format: date-time
          description: Timestamp when the card was created
          example: "2025-05-01T12:00:00.000Z"
        createdOnBlock:
          type: integer
          description: Block number when the card was created
          example: 22516300
        creationHash:
          type: string
          description: Transaction hash of the creation transaction
          example: "0xabcdef..."
        redeemedBy:
          type: string
          description: Address that redeemed the card (null if not redeemed)
          example: "0x9876543210abcdef1234567890abcdef12345678"
        partner:
          type: string
          description: Partner address used during redemption (0x0000000000000000000000000000000000000000 if no partner or null if not redeemed)
          example: "0x1111222233334444555566667777888899990000"
        redeemedAt:
          type: string
          format: date-time
          description: Timestamp when the card was redeemed (null if not redeemed)
        redeemedOnBlock:
          type: integer
          description: Block number when the card was redeemed (null if not redeemed)
        redemptionHash:
          type: string
          description: Transaction hash of the redemption transaction (null if not redeemed)
        cancelledBy:
          type: string
          description: Address that cancelled the card (null if not cancelled)
        cancelledAt:
          type: string
          format: date-time
          description: Timestamp when the card was cancelled (null if not cancelled)
        cancelledOnBlock:
          type: integer
          description: Block number when the card was cancelled (null if not cancelled)
        cancellationHash:
          type: string
          description: Transaction hash of the cancellation transaction (null if not cancelled)

    Chain:
      type: object
      properties:
        id:
          type: integer
          description: Chain ID
          example: 1
        name:
          type: string
          description: Chain name
          example: "Ethereum"
        chainPrefix:
          type: string
          description: Chain prefix for card IDs
          example: "01"
        assetPlatformId:
          type: string
          description: Asset platform ID for external integrations
          example: "ethereum"
        rpcUrl:
          type: string
          description: Primary RPC URL for the chain
          example: "wss://eth-mainnet.g.alchemy.com/v2"
        rpcUrl2:
          type: string
          description: Fallback RPC URL for the chain
          example: "wss://mainnet.infura.io/ws/v3"
        explorerUrl:
          type: string
          description: Explorer URL for the chain
          example: "https://etherscan.io"
        deploymentBlock:
          type: integer
          description: Block number where the contract was deployed
          example: 22516250
        contractAddress:
          type: string
          description: Address of the deployed contract
          example: "0x1234567890abcdef1234567890abcdef12345678"
        chainLogo:
          type: string
          description: URL to chain logo image
          example: "https://univoucher.com/images/chains/ethereum-eth-logo.png"
        nativeCurrencyName:
          type: string
          description: Name of the native currency
          example: "Ethereum"
        nativeCurrencySymbol:
          type: string
          description: Symbol of the native currency
          example: "ETH"
        nativeCurrencyDecimals:
          type: integer
          description: Number of decimals for the native currency
          example: 18
        nativeCurrencyLogo:
          type: string
          description: URL to native currency logo image
          example: "https://univoucher.com/images/chains/images/tokens/eth.png"
        feePercentage:
          type: number
          format: float
          description: Current fee percentage
          example: 0.01
      
  responses:
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: Internal server error
              message:
                type: string
                example: An unexpected error occurred