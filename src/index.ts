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
import { logger } from "./utils/logger.js";
import { createServer } from "http";

const SERVER_NAME = "univoucher-mcp";
const SERVER_VERSION = "1.0.0";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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
      
      if (name.startsWith("search_docs")) {
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
    logger.info(`${SERVER_NAME} v${SERVER_VERSION} MCP server started`);
  }

  async startHttpServer(): Promise<void> {
    // Create HTTP server for health checks and deployment
    const httpServer = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          name: SERVER_NAME,
          version: SERVER_VERSION,
          message: 'UniVoucher MCP Server is running'
        }));
      } else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name: SERVER_NAME,
          version: SERVER_VERSION,
          description: 'UniVoucher MCP Server - Model Context Protocol server for UniVoucher documentation and API',
          endpoints: {
            '/health': 'Health check endpoint',
            '/': 'Server information'
          },
          usage: 'This is an MCP server. Connect using MCP client tools.',
          documentation: 'https://docs.univoucher.com',
          api: 'https://api.univoucher.com'
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    httpServer.listen(PORT, () => {
      logger.info(`${SERVER_NAME} HTTP server listening on port ${PORT}`);
    });
  }
}

// Determine how to start based on environment
const server = new UniVoucherMCPServer();

if (process.env.NODE_ENV === 'production' || process.env.HTTP_MODE === 'true') {
  // Start HTTP server for deployment
  server.startHttpServer().catch((error) => {
    logger.error("Failed to start HTTP server:", error);
    process.exit(1);
  });
} else {
  // Start MCP server on stdio for local development
  server.start().catch((error) => {
    logger.error("Failed to start MCP server:", error);
    process.exit(1);
  });
} 