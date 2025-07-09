import { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class UniVoucherDocumentationProvider {
  private docsPath: string;

  constructor() {
    this.docsPath = join(__dirname, "..", "..", "docs");
  }

  async listResources(): Promise<Resource[]> {
    return [
      {
        uri: "univoucher://docs/index",
        name: "UniVoucher Documentation Index",
        description: "Main documentation index and overview",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/faq",
        name: "FAQ",
        description: "Frequently asked questions about UniVoucher",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/fees",
        name: "Fees",
        description: "Information about UniVoucher fees and pricing",
        mimeType: "text/markdown",
      },
      // User Guide
      {
        uri: "univoucher://docs/user-guide/quick-start",
        name: "Quick Start Guide",
        description: "Get started with UniVoucher quickly",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/wallet-connection",
        name: "Wallet Connection",
        description: "How to connect your wallet to UniVoucher",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/creating-gift-cards",
        name: "Creating Gift Cards",
        description: "Complete guide to creating crypto gift cards",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/bulk-creation",
        name: "Bulk Creation",
        description: "Create multiple gift cards at once",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/viewing-gift-cards",
        name: "Viewing Gift Cards",
        description: "How to view and manage your gift cards",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/redeeming-gift-cards",
        name: "Redeeming Gift Cards",
        description: "How to redeem UniVoucher gift cards",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/user-guide/managing-your-cards",
        name: "Managing Your Cards",
        description: "Manage your created and received cards",
        mimeType: "text/markdown",
      },
      // Technical Documentation
      {
        uri: "univoucher://docs/technical/how-it-works",
        name: "How It Works",
        description: "Technical overview of UniVoucher protocol",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/technical/smart-contract",
        name: "Smart Contract",
        description: "UniVoucher smart contract technical details",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/technical/supported-networks",
        name: "Supported Networks",
        description: "Blockchain networks supported by UniVoucher",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/technical/card-security",
        name: "Card Security",
        description: "Security aspects of UniVoucher cards",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/technical/card-id-format",
        name: "Card ID Format",
        description: "Understanding UniVoucher card ID structure",
        mimeType: "text/markdown",
      },
      // Developer Resources
      {
        uri: "univoucher://docs/developers/integration-guide",
        name: "Integration Guide",
        description: "Complete guide for integrating UniVoucher",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/developers/security",
        name: "Developer Security",
        description: "Security considerations for developers",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/developers/api-reference",
        name: "API Reference",
        description: "UniVoucher API reference documentation",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/developers/mcp",
        name: "MCP Integration",
        description: "Model Context Protocol setup and integration guide",
        mimeType: "text/markdown",
      },
      // Media & Branding
      {
        uri: "univoucher://docs/media-kit",
        name: "Media Kit",
        description: "UniVoucher branding guidelines and media resources",
        mimeType: "text/markdown",
      },
      // Legal Documents
      {
        uri: "univoucher://docs/privacy-policy",
        name: "Privacy Policy",
        description: "UniVoucher privacy policy",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/license",
        name: "License",
        description: "UniVoucher license information",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/disclaimer",
        name: "Disclaimer",
        description: "UniVoucher legal disclaimer",
        mimeType: "text/markdown",
      },
      {
        uri: "univoucher://docs/partner-program",
        name: "Partner Program",
        description: "UniVoucher Partner Program - earn 1% fees on redemptions",
        mimeType: "text/markdown",
      },
    ];
  }

  async readResource(uri: string): Promise<{ contents: { type: string; text: string }[] }> {
    const docPath = uri.replace("univoucher://docs/", "");
    
    try {
      let filePath: string;
      
      if (docPath.includes("/")) {
        // Handle subdirectory paths like "user-guide/quick-start"
        filePath = join(this.docsPath, `${docPath}.md`);
      } else {
        // Handle root level files like "index", "faq", "fees"
        filePath = join(this.docsPath, `${docPath}.md`);
      }
      
      const content = await readFile(filePath, "utf-8");
      
      return {
        contents: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Documentation not found: ${docPath}`);
    }
  }

  async listTools(): Promise<Tool[]> {
    return [
      {
        name: "list_doc_pages",
        description: "List all available UniVoucher documentation pages with their descriptions to help find the right content",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Filter by documentation category (optional)",
              enum: ["user-guide", "technical", "developers", "general", "legal"],
            },
          },
          required: [],
        },
      },
      {
        name: "get_doc_page",
        description: "Get the complete content of a specific UniVoucher documentation page. Much more effective than searching - returns the entire page content.",
        inputSchema: {
          type: "object",
          properties: {
            page: {
              type: "string",
              description: "The documentation page to retrieve. Use exact page identifiers from list_doc_pages.",
              enum: [
                "index",
                "faq", 
                "fees",
                "disclaimer",
                "privacy-policy",
                "license",
                "user-guide/quick-start",
                "user-guide/wallet-connection", 
                "user-guide/creating-gift-cards",
                "user-guide/bulk-creation",
                "user-guide/viewing-gift-cards",
                "user-guide/redeeming-gift-cards",
                "user-guide/managing-your-cards",
                "technical/how-it-works",
                "technical/smart-contract",
                "technical/supported-networks", 
                "technical/card-security",
                "technical/card-id-format",
                "developers/integration-guide",
                "developers/security",
                "developers/api-reference",
                "developers/mcp",
                "media-kit",
                "partner-program"
              ],
            },
          },
          required: ["page"],
        },
      },
      {
        name: "get_multiple_doc_pages",
        description: "Get the complete content of multiple UniVoucher documentation pages at once. Useful when you need comprehensive information across multiple related topics.",
        inputSchema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "index",
                  "faq", 
                  "fees",
                  "disclaimer",
                  "privacy-policy",
                  "license",
                  "user-guide/quick-start",
                  "user-guide/wallet-connection", 
                  "user-guide/creating-gift-cards",
                  "user-guide/bulk-creation",
                  "user-guide/viewing-gift-cards",
                  "user-guide/redeeming-gift-cards",
                  "user-guide/managing-your-cards",
                  "technical/how-it-works",
                  "technical/smart-contract",
                  "technical/supported-networks", 
                  "technical/card-security",
                  "technical/card-id-format",
                  "developers/integration-guide",
                  "developers/security",
                  "developers/api-reference",
                  "developers/mcp",
                  "media-kit",
                  "partner-program"
                ],
              },
              description: "Array of documentation pages to retrieve",
              minItems: 1,
              maxItems: 10,
            },
          },
          required: ["pages"],
        },
      },
    ];
  }

  async callTool(name: string, args: any): Promise<{ content: { type: string; text: string }[] }> {
    if (name === "list_doc_pages") {
      return await this.listDocPages(args.category);
    } else if (name === "get_doc_page") {
      return await this.getDocPage(args.page);
    } else if (name === "get_multiple_doc_pages") {
      return await this.getMultipleDocPages(args.pages);
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }

  private async listDocPages(category?: string): Promise<{ content: { type: string; text: string }[] }> {
    const resources = await this.listResources();
    
    let filteredResources = resources;
    if (category) {
      filteredResources = resources.filter(resource => {
        const path = resource.uri.replace("univoucher://docs/", "");
        switch (category) {
          case "user-guide":
            return path.startsWith("user-guide/");
          case "technical": 
            return path.startsWith("technical/");
          case "developers":
            return path.startsWith("developers/");
          case "legal":
            return ["privacy-policy", "license", "disclaimer"].includes(path);
          case "general":
            return !path.includes("/") && !["privacy-policy", "license", "disclaimer"].includes(path);
          default:
            return true;
        }
      });
    }

    const pageList = filteredResources.map(resource => {
      const page = resource.uri.replace("univoucher://docs/", "");
      return `**${page}** - ${resource.name}\n  ${resource.description}`;
    }).join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `# Available UniVoucher Documentation Pages\n\n${pageList}\n\n**Usage:** Use the page identifier (in bold) with the \`get_doc_page\` tool to retrieve the full content of any page.`,
        },
      ],
    };
  }

  private async getDocPage(page: string): Promise<{ content: { type: string; text: string }[] }> {
    try {
      let filePath: string;
      
      if (page.includes("/")) {
        // Handle subdirectory paths like "user-guide/quick-start"
        filePath = join(this.docsPath, `${page}.md`);
      } else {
        // Handle root level files like "index", "faq", "fees"
        filePath = join(this.docsPath, `${page}.md`);
      }
      
      const content = await readFile(filePath, "utf-8");
      
      return {
        content: [
          {
            type: "text",
            text: `# Documentation: ${page}\n\n${content}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Documentation page not found: ${page}. Use list_doc_pages to see available pages.`);
    }
  }

  private async getMultipleDocPages(pages: string[]): Promise<{ content: { type: string; text: string }[] }> {
    const results: string[] = [];
    
    for (const page of pages) {
      try {
        let filePath: string;
        
        if (page.includes("/")) {
          filePath = join(this.docsPath, `${page}.md`);
        } else {
          filePath = join(this.docsPath, `${page}.md`);
        }
        
        const content = await readFile(filePath, "utf-8");
        results.push(`# Documentation: ${page}\n\n${content}\n\n---\n`);
      } catch (error) {
        results.push(`# Documentation: ${page}\n\n**Error:** Page not found\n\n---\n`);
      }
    }
    
    return {
      content: [
        {
          type: "text",
          text: results.join("\n"),
        },
      ],
    };
  }
} 