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
        name: "search_docs",
        description: "Search UniVoucher documentation for specific topics",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for documentation",
            },
            section: {
              type: "string",
              description: "Specific documentation section to search in (optional)",
              enum: ["index", "faq", "fees", "user-guide", "technical", "developers", "privacy-policy", "license", "disclaimer"],
            },
          },
          required: ["query"],
        },
      },
    ];
  }

  async callTool(name: string, args: any): Promise<{ content: { type: string; text: string }[] }> {
    if (name === "search_docs") {
      return await this.searchDocs(args.query, args.section);
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }

  private async searchDocs(query: string, section?: string): Promise<{ content: { type: string; text: string }[] }> {
    const results: string[] = [];
    
    if (section) {
      // Search in specific section
      await this.searchInSection(query, section, results);
    } else {
      // Search in all sections
      const allSections = ["index", "faq", "fees", "user-guide", "technical", "developers", "privacy-policy", "license", "disclaimer"];
      for (const sec of allSections) {
        await this.searchInSection(query, sec, results);
      }
    }
    
    const resultText = results.length > 0 
      ? results.join("\n\n") 
      : `No results found for "${query}"`;
    
    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  }

  private async searchInSection(query: string, section: string, results: string[]): Promise<void> {
    try {
      if (["user-guide", "technical", "developers"].includes(section)) {
        // Search in subdirectories
        const sectionDir = join(this.docsPath, section);
        const { readdir } = await import("fs/promises");
        const files = await readdir(sectionDir);
        
        for (const file of files) {
          if (file.endsWith(".md") && !file.startsWith(".")) {
            const filePath = join(sectionDir, file);
            const content = await readFile(filePath, "utf-8");
            const matchingLines = this.findMatchingLines(content, query);
            
            if (matchingLines.length > 0) {
              const fileName = file.replace(".md", "");
              results.push(`## ${section.toUpperCase()}/${fileName.replace("-", " ").toUpperCase()}\n${matchingLines.join("\n")}`);
            }
          }
        }
      } else {
        // Search in root level files
        const filePath = join(this.docsPath, `${section}.md`);
        const content = await readFile(filePath, "utf-8");
        const matchingLines = this.findMatchingLines(content, query);
        
        if (matchingLines.length > 0) {
          results.push(`## ${section.replace("-", " ").toUpperCase()}\n${matchingLines.join("\n")}`);
        }
      }
    } catch (error) {
      // Skip missing files or directories
    }
  }

  private findMatchingLines(content: string, query: string): string[] {
    const lines = content.split("\n");
    return lines.filter((line: string) => 
      line.toLowerCase().includes(query.toLowerCase())
    );
  }
} 