# Model Context Protocol (MCP)

The UniVoucher Model Context Protocol (MCP) provides AI applications with seamless access to UniVoucher's decentralized gift card platform. This enables AI agents and applications to query card data, retrieve documentation, and interact with the UniVoucher ecosystem without complex integrations.

## What is Model Context Protocol (MCP)?

Model Context Protocol (MCP) is an open-source standard by Anthropic that lets AI applications access external data sources in real-time. Think of it as a "USB-C port for AI" - enabling standardized connections to tools and data.

## UniVoucher MCP Capabilities

The UniVoucher MCP server provides:

- **Documentation Access**: All 22+ documentation pages (guides, technical docs, API reference)
- **Card Queries**: Search and filter gift cards by status, chain, creator, etc.
- **Card Details**: Get specific card information by ID or slot ID
- **Network Info**: Supported blockchain networks and configurations
- **Fee Data**: Current fees and historical fee information

## Setup Instructions

### Cursor IDE

Add to your `mcp.json` file:

```json
{
  "mcpServers": {
    "univoucher": {
      "command": "npx",
      "args": ["-y", "univoucher-mcp@latest"],
      "env": {}
    }
  }
}
```

Restart Cursor after adding the configuration.

### Claude Desktop

Edit your config file and restart Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "univoucher": {
      "command": "npx",
      "args": ["-y", "univoucher-mcp@latest"]
    }
  }
}
```

### Other Applications

For Windsurf, Cline, or other MCP-compatible apps, use the same configuration format in their respective MCP settings.

## Why Use UniVoucher MCP?

- **Instant Integration**: No custom API integration needed
- **Real-time Data**: Always up-to-date information
- **AI-Powered Development**: AI can access docs and data during coding
- **Comprehensive Access**: Full UniVoucher ecosystem in one interface

## Example: Redeem Base

[Redeem Base](https://redeembase.com) was built using UniVoucher MCP with Cursor IDE and Claude 4 Sonnet. The MCP enabled:

- Real-time access to UniVoucher documentation during development
- AI-generated code following UniVoucher best practices
- Rapid prototyping with gasless redemption features
- Complete multi-chain support implementation

## Usage

Once configured, simply reference UniVoucher in your AI prompts:

```
"Help me build a gift card redemption interface using UniVoucher"
"Show me how to query active gift cards on Base network"
"Help me build a UniVoucher woocommerce plugin"
```

The AI will automatically access UniVoucher data and documentation to provide accurate, working solutions.

---

**Related Documentation:**

- [Integration Guide](integration-guide.md) - Complete technical integration
- [API Reference](api-reference.md) - Traditional API docs
- [Partner Program](../partner-program.md) - Earn fees with integrations