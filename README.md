# UniVoucher MCP Server

A Model Context Protocol (MCP) server that provides access to UniVoucher documentation and API for developers building integrations with the world's first decentralized crypto gift card protocol.

## What is UniVoucher?

UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains.

## Quick Start

> **Note**: You don't need to install this package manually. Just add the configuration below to your MCP client (Cursor, Claude Desktop, etc.) and it will automatically download and run when needed.

### For Cursor Users

Add this to your Cursor MCP configuration:

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

### For Claude Desktop Users

Add this to your Claude Desktop MCP configuration:

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

### Manual Installation (Optional)

```bash
npm install -g univoucher-mcp
```

Then use `univoucher-mcp` directly in your MCP configuration.

## Features

### 📚 Documentation Access
- Complete UniVoucher documentation pages delivered in full
- Browse and discover all available documentation
- Get multiple related pages at once for comprehensive information
- No more search guessing - get the exact page you need

### 📊 Live API Access
- Query gift cards with advanced filtering
- Get current fees across all supported chains
- Check supported blockchain networks
- Retrieve real-time protocol statistics

### 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `list_doc_pages` | List all available documentation pages with descriptions |
| `get_doc_page` | Get complete content of a specific documentation page |
| `get_multiple_doc_pages` | Get complete content of multiple documentation pages at once |
| `query_api_cards` | Query gift cards from the protocol |
| `get_single_card` | Get details of a specific card |
| `get_current_fees` | Get current protocol fees |
| `get_chains` | Get supported blockchain networks |
| `get_fee_history` | Get historical fee data |

## Example Usage

Once configured, you can ask your AI assistant:

- "Show me the complete UniVoucher integration guide for developers"
- "Get me the full documentation on creating gift cards"
- "What are the current fees on Ethereum?"
- "List all available UniVoucher documentation pages"
- "Show me the technical documentation on how UniVoucher works"
- "Get the API reference and security documentation"
- "How many cards are in the UniVoucher protocol?"

## Support

- **GitHub**: [UniVoucher MCP Issues](https://github.com/UniVoucher/UniVoucher-MCP/issues)
- **Telegram**: [UniVoucher Community](https://t.me/univoucher)
- **Documentation**: [docs.univoucher.com](https://docs.univoucher.com)
- **API**: [api.univoucher.com](https://api.univoucher.com)

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for the UniVoucher ecosystem 