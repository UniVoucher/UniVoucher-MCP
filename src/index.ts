#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { UniVoucherDocumentationProvider } from "./providers/documentation.js";
import { UniVoucherAPIProvider } from "./providers/api.js";

const SERVER_NAME = "univoucher-mcp";
const SERVER_VERSION = "1.4.0";

class UniVoucherMCPServer {
  private server: Server;
  private docProvider: UniVoucherDocumentationProvider;
  private apiProvider: UniVoucherAPIProvider;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.docProvider = new UniVoucherDocumentationProvider();
    this.apiProvider = new UniVoucherAPIProvider();

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const docResources = await this.docProvider.listResources();
      const apiResources = await this.apiProvider.listResources();
      
      return {
        resources: [...docResources, ...apiResources],
      };
    });

    // Read specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri.startsWith("univoucher://docs/")) {
        return await this.docProvider.readResource(uri);
      } else if (uri.startsWith("univoucher://api/")) {
        return await this.apiProvider.readResource(uri);
      }
      
      throw new Error(`Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const docTools = await this.docProvider.listTools();
      const apiTools = await this.apiProvider.listTools();
      
      return {
        tools: [...docTools, ...apiTools],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name.startsWith("list_doc_pages") || name.startsWith("get_doc_page") || name.startsWith("get_multiple_doc_pages")) {
        return await this.docProvider.callTool(name, args);
      } else if (name.startsWith("query_api") || name.startsWith("get_")) {
        return await this.apiProvider.callTool(name, args);
      }
      
      throw new Error(`Unknown tool: ${name}`);
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "univoucher_support",
            description: "Get comprehensive support information from UniVoucher documentation. Provides verified information for general help, technical questions, integration guidance, and troubleshooting.",
            arguments: [
              {
                name: "query",
                description: "Your question or the specific topic you need help with (e.g., 'How to create gift cards', 'Integration with my app', 'Troubleshoot failed transaction')",
                required: true,
              },
              {
                name: "support_type",
                description: "Type of support needed",
                required: false,
              }
            ],
          },
          {
            name: "univoucher_api_query",
            description: "Query UniVoucher API for real-time protocol data. Get current fees, card details, chain information, and more.",
            arguments: [
              {
                name: "query_type",
                description: "Type of information to retrieve (e.g., 'card_details', 'current_fees', 'user_cards', 'chain_info')",
                required: true,
              },
              {
                name: "parameters",
                description: "Specific parameters for the query (e.g., card ID, wallet address, chain ID)",
                required: false,
              }
            ],
          },
        ],
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === "univoucher_support") {
        const query = args?.query || "general help";
        const supportType = args?.support_type || "general";
        
        return {
          description: `UniVoucher Support: ${supportType}`,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need help with UniVoucher. Here's my question: "${query}"

Please provide comprehensive support based ONLY on verified information from the UniVoucher documentation. Follow these guidelines:

1. **Use only 100% verified information** from UniVoucher docs - no guessing or assumptions
2. **Search multiple relevant documentation pages** to provide complete answers
3. **For general help**: Cover basic concepts, getting started, and common use cases
4. **For technical questions**: Provide detailed technical information, code examples, and implementation details
5. **For integration guidance**: Include step-by-step integration instructions, API references, and best practices
6. **For troubleshooting**: Identify common issues and provide verified solutions from the docs

If the documentation doesn't contain specific information about my question, clearly state that and suggest where I might find additional help.

Please start by searching the relevant UniVoucher documentation pages to gather verified information before responding.`,
              },
            },
          ],
        };
      } else if (name === "univoucher_api_query") {
        const queryType = args?.query_type || "general_info";
        const parameters = args?.parameters || "none specified";
        
        return {
          description: `UniVoucher API Query: ${queryType}`,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need to query the UniVoucher API for real-time information. Here are the details:

**Query Type**: ${queryType}
**Parameters**: ${parameters}

Please help me get the following information using the UniVoucher API:

${this.getAPIQueryInstructions(queryType)}

Use the appropriate UniVoucher API tools to fetch real-time data and provide a clear, formatted response with the requested information.`,
              },
            },
          ],
        };
      }
      
      throw new Error(`Unknown prompt: ${name}`);
    });
  }

  private getAPIQueryInstructions(queryType: string): string {
    const instructions: Record<string, string> = {
      card_details: "- Get detailed information about a specific gift card (provide card ID or slot ID)\n- Show card status, amount, token, creator, and redemption details",
      current_fees: "- Get current protocol fees for specific chains\n- Show fee percentages and any recent changes",
      user_cards: "- Get all cards associated with a wallet address\n- Filter by creator, redeemer, or cards belonging to address\n- Show card counts and summaries",
      chain_info: "- Get information about supported blockchain networks\n- Show network details, contract addresses, and availability",
      fee_history: "- Get historical fee data for specific chains\n- Show fee changes over time",
      protocol_stats: "- Get general protocol statistics\n- Show total cards, active cards, and other metrics",
    };

    return instructions[queryType] || `- Get ${queryType} information from the UniVoucher protocol\n- Use appropriate API endpoints to fetch real-time data`;
  }

  async start(): Promise<void> {
    // Start MCP server on stdio
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the MCP server
const server = new UniVoucherMCPServer();

server.start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
}); 