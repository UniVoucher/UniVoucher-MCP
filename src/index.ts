#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { UniVoucherDocumentationProvider } from "./providers/documentation.js";
import { UniVoucherAPIProvider } from "./providers/api.js";

const SERVER_NAME = "univoucher-mcp";
const SERVER_VERSION = "1.3.2";

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