import { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import YAML from "yaml";

export class UniVoucherAPIProvider {
  private baseUrl = "https://api.univoucher.com/v1";
  private openApiUrl = "https://api.univoucher.com/openapi.yaml";
  private cachedOpenApiSpec: any = null;

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
        description: "Get details of a single card by ID or slot ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "integer", description: "Card ID" },
            slotId: { type: "string", description: "Card slot ID" },
          },
          oneOf: [
            { required: ["id"] },
            { required: ["slotId"] },
          ],
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
            chainId: { type: "integer", description: "Chain ID", required: true },
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