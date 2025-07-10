# UniVoucher MCP Server

**Official Model Context Protocol (MCP) server for [UniVoucher.com](https://univoucher.com)** - the world's first decentralized crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains.


## What is UniVoucher?

UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains including Ethereum, Polygon, BSC, and more.

## 🚀 Quick Installation

> **Note**: No manual installation needed! Just add the configuration below to your MCP client and it will automatically download and run when needed.

### MCP Configuration

Add this to your MCP configuration file (`mcp.json` or equivalent):

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

### Supported MCP Clients

- **Cursor**: Add to your Cursor MCP settings
- **Claude Desktop**: Add to your Claude Desktop configuration
- **Any MCP-compatible client**: Use the configuration above

### Alternative Installation Methods

#### Global Installation
```bash
npm install -g univoucher-mcp@latest
```

#### Specific Version Installation
```bash
npm install univoucher-mcp@1.3.4
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

## Links

- **Official Website**: [univoucher.com](https://univoucher.com)
- **Documentation**: [docs.univoucher.com](https://docs.univoucher.com)
- **API**: [api.univoucher.com](https://api.univoucher.com)
- **GitHub**: [UniVoucher MCP Repository](https://github.com/UniVoucher/UniVoucher-MCP)
- **NPM Package**: [univoucher-mcp](https://www.npmjs.com/package/univoucher-mcp)

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/UniVoucher/UniVoucher-MCP/issues)
- **Telegram**: [UniVoucher Community](https://t.me/univoucher)
- **Email**: support@univoucher.com

## License

Business Source License 1.1 - see LICENSE file for details

This project will transition to MIT License on 2035-05-04

---

[![MCP Badge](https://lobehub.com/badge/mcp/univoucher-univoucher-mcp)](https://lobehub.com/mcp/univoucher-univoucher-mcp)

Built with ❤️ for the UniVoucher ecosystem | **[Visit UniVoucher.com](https://univoucher.com)** 