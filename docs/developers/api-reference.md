openapi: 3.0.3
info:
  title: UniVoucher API
  description: >
    <p>UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains.</p>
    <p><b>This API is completely free and public to use</b> - no API key required! With a single version, you can directly integrate with our endpoints without any registration or authentication process.</p>
    <p>This is a <b>read-only</b> API and is designed to provide information about the UniVoucher ecosystem. You can use it to retrieve details about gift cards, query cards associated with specific addresses or blockchains, check current protocol fees, and more...</p>
    <p>To perform actions such as creating or redeeming gift cards, you must interact directly with the UniVoucher smart contract. Please refer to our <a target="_blank" href="https://docs.univoucher.com/developers/integration-guide/">Integration Guide</a> for guidance.</p>
    <p>As a decentralized application, UniVoucher does not rely on centralized servers. Gift cards are generated locally on users' devices and stored securely on the blockchain. This API is designed to index the blockchain data and provide a way to query it. It is not a full-featured API and is not intended to be used for any other purpose than to query the blockchain data.</p>
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