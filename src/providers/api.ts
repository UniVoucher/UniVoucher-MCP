import { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import YAML from "yaml";

export class UniVoucherAPIProvider {
  private baseUrl = "https://api.univoucher.com/v1";
  private openApiUrl = "https://api.univoucher.com/openapi.yaml";
  private cachedOpenApiSpec: any = null;
  private privateKey: string | null = null;

  constructor() {
    // Get private key from environment variable (standard Ethereum wallet private key)
    const rawPrivateKey = process.env.WALLET_PRIVATE_KEY || null;
    if (rawPrivateKey) {
      // Accept private key with or without 0x prefix
      this.privateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey.slice(2) : rawPrivateKey;
    } else {
      this.privateKey = null;
    }
  }

  async listResources(): Promise<Resource[]> {
    return [
      {
        uri: "univoucher://api/openapi-spec",
        name: "UniVoucher OpenAPI Specification",
        description: "Complete OpenAPI specification for UniVoucher API",
        mimeType: "application/yaml",
      },
      {
        uri: "univoucher://api/endpoints",
        name: "API Endpoints",
        description: "List of available API endpoints with descriptions",
        mimeType: "application/json",
      },
    ];
  }

  async readResource(uri: string): Promise<{ contents: { type: string; text: string }[] }> {
    const resourceType = uri.replace("univoucher://api/", "");
    
    switch (resourceType) {
      case "openapi-spec":
        return await this.getOpenApiSpec();
      case "endpoints":
        return await this.getEndpointsList();
      default:
        throw new Error(`Unknown API resource: ${resourceType}`);
    }
  }

  async listTools(): Promise<Tool[]> {
    return [
      {
        name: "query_api_cards",
        description: "Query UniVoucher cards with various filters",
        inputSchema: {
          type: "object",
          properties: {
            page: { type: "integer", description: "Page number", default: 1 },
            limit: { type: "integer", description: "Results per page", default: 20 },
            status: { 
              type: "string", 
              enum: ["active", "redeemed", "cancelled"],
              description: "Filter by card status" 
            },
            chain: { type: "integer", description: "Filter by chain ID" },
            creator: { type: "string", description: "Filter by creator address" },
            redeemedBy: { type: "string", description: "Filter by redeemer address" },
            belongTo: { 
              type: "string", 
              description: "Filter cards created by OR redeemed by this address" 
            },
            tokenAddress: { type: "string", description: "Filter by token address" },
            sortDirection: { 
              type: "string", 
              enum: ["asc", "desc"], 
              description: "Sort direction",
              default: "desc" 
            },
          },
        },
      },
      {
        name: "get_single_card",
        description: "Get details of a single card by ID (integer) or slot ID (string). Provide either id OR slotId, not both.",
        inputSchema: {
          type: "object",
          properties: {
            id: { 
              type: "integer", 
              description: "Card ID (use this OR slotId, not both)" 
            },
            slotId: { 
              type: "string", 
              description: "Card slot ID (use this OR id, not both)" 
            },
          },
        },
      },
      {
        name: "create_gift_card",
        description: "Create a new UniVoucher gift card using your standard Ethereum crypto wallet private key. The private key is optional and can be set via WALLET_PRIVATE_KEY environment variable (with or without 0x prefix). Uses Direct Response Mode for immediate card details.",
        inputSchema: {
          type: "object",
          properties: {
            chainId: { 
              type: "integer", 
              description: "Chain ID where to create the card (e.g., 1 for Ethereum, 56 for BNB Chain, 137 for Polygon)",
              required: true
            },
            tokenAddress: { 
              type: "string", 
              description: "Token address (use 0x0000000000000000000000000000000000000000 for native currency)",
              required: true
            },
            tokenAmount: { 
              type: "string", 
              description: "Amount of tokens to store in the card (as string to handle large numbers)",
              required: true
            },
            message: { 
              type: "string", 
              description: "Optional message to attach to the card"
            },
            quantity: { 
              type: "integer", 
              description: "Number of cards to create (1-100)",
              minimum: 1,
              maximum: 100,
              default: 1
            },
            orderId: { 
              type: "string", 
              description: "Order ID for user reference (auto-generated if not provided)"
            },
          },
          required: ["chainId", "tokenAddress", "tokenAmount"],
        },
      },
      {
        name: "get_current_fees",
        description: "Get current fee percentages for chains",
        inputSchema: {
          type: "object",
          properties: {
            chainId: { 
              type: "integer", 
              description: "Specific chain ID (optional - returns all if not specified)" 
            },
          },
        },
      },
      {
        name: "get_fee_history",
        description: "Get fee update history for a specific chain",
        inputSchema: {
          type: "object",
          properties: {
            chainId: { type: "integer", description: "Chain ID" },
          },
          required: ["chainId"],
        },
      },
      {
        name: "get_chains",
        description: "Get information about supported chains",
        inputSchema: {
          type: "object",
          properties: {
            chain: { 
              type: "integer", 
              description: "Specific chain ID (optional - returns all if not specified)" 
            },
          },
        },
      },
    ];
  }

  async callTool(name: string, args: any): Promise<{ content: { type: string; text: string }[] }> {
    try {
      let result: any;
      
      switch (name) {
        case "query_api_cards":
          result = await this.queryCards(args);
          break;
        case "get_single_card":
          result = await this.getSingleCard(args);
          break;
        case "create_gift_card":
          result = await this.createGiftCard(args);
          break;
        case "get_current_fees":
          result = await this.getCurrentFees(args);
          break;
        case "get_fee_history":
          result = await this.getFeeHistory(args);
          break;
        case "get_chains":
          result = await this.getChains(args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getOpenApiSpec(): Promise<{ contents: { type: string; text: string }[] }> {
    try {
      const response = await fetch(this.openApiUrl);
      const yamlText = await response.text();
      
      return {
        contents: [
          {
            type: "text",
            text: yamlText,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch OpenAPI spec: ${error}`);
    }
  }

  private async getEndpointsList(): Promise<{ contents: { type: string; text: string }[] }> {
    try {
      if (!this.cachedOpenApiSpec) {
        const response = await fetch(this.openApiUrl);
        const yamlText = await response.text();
        this.cachedOpenApiSpec = YAML.parse(yamlText);
      }

      const endpoints = Object.entries(this.cachedOpenApiSpec.paths).map(([path, methods]: [string, any]) => {
        const endpointMethods = Object.entries(methods).map(([method, details]: [string, any]) => ({
          method: method.toUpperCase(),
          summary: details.summary,
          description: details.description,
        }));
        
        return {
          path,
          methods: endpointMethods,
        };
      });

      return {
        contents: [
          {
            type: "text",
            text: JSON.stringify(endpoints, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to parse OpenAPI spec: ${error}`);
    }
  }

  private async queryCards(params: any): Promise<any> {
    const url = new URL(`${this.baseUrl}/cards/all`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getSingleCard(params: { id?: number; slotId?: string }): Promise<any> {
    const url = new URL(`${this.baseUrl}/cards/single`);
    
    if (params.id) {
      url.searchParams.append("id", String(params.id));
    } else if (params.slotId) {
      url.searchParams.append("slotId", params.slotId);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async createGiftCard(params: {
    chainId: number;
    tokenAddress: string;
    tokenAmount: string;
    message?: string;
    quantity?: number;
    orderId?: string;
  }): Promise<any> {
    // Check if private key is available (optional for card creation)
    if (!this.privateKey) {
      throw new Error("Wallet private key not found. Please set the WALLET_PRIVATE_KEY environment variable with your standard Ethereum crypto wallet private key (with or without 0x prefix).");
    }

    // Validate required parameters
    if (!params.chainId || !params.tokenAddress || !params.tokenAmount) {
      throw new Error("Missing required parameters: chainId, tokenAddress, and tokenAmount are required.");
    }

    // Validate chain ID (common supported chains)
    const supportedChains = [1, 8453, 56, 137, 42161, 10, 43114]; // Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche
    if (!supportedChains.includes(params.chainId)) {
      throw new Error(`Unsupported chain ID: ${params.chainId}. Supported chains: ${supportedChains.join(", ")}`);
    }

    // Validate token address format
    if (!params.tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid token address format. Must be a valid Ethereum address.");
    }

    // Validate token amount (should be a positive number string)
    if (!params.tokenAmount || isNaN(Number(params.tokenAmount)) || Number(params.tokenAmount) <= 0) {
      throw new Error("Invalid token amount. Must be a positive number.");
    }

    // Generate order ID if not provided
    const orderId = params.orderId || `mcp_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const requestBody = {
      privateKey: this.privateKey,
      network: params.chainId, // API expects 'network' not 'chainId'
      tokenAddress: params.tokenAddress,
      amount: params.tokenAmount, // API expects 'amount' not 'tokenAmount'
      quantity: params.quantity || 1,
      orderId: orderId,
      ...(params.message && { message: params.message }),
    };

    const response = await fetch(`${this.baseUrl}/cards/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Card creation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }

  private async getCurrentFees(params: { chainId?: number }): Promise<any> {
    const url = new URL(`${this.baseUrl}/fees/current`);
    
    if (params.chainId) {
      url.searchParams.append("chainId", String(params.chainId));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getFeeHistory(params: { chainId: number }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/fees/history/${params.chainId}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getChains(params: { chain?: number }): Promise<any> {
    const url = new URL(`${this.baseUrl}/chains`);
    
    if (params.chain) {
      url.searchParams.append("chain", String(params.chain));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
} 