# UniVoucher MCP Server

A Model Context Protocol (MCP) server that provides access to UniVoucher documentation and API for developers building integrations with the world's first decentralized crypto gift card protocol.

## What is UniVoucher?

UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains.

## Quick Start

### For Cursor Users

Add this to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "univoucher": {
      "command": "npx",
      "args": ["univoucher-mcp@latest"],
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
      "args": ["univoucher-mcp@latest"],
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

### 🔍 Documentation Search
- Complete UniVoucher user guides and technical documentation
- Developer integration guides and API reference
- Security best practices and implementation examples

### 📊 Live API Access
- Query gift cards with advanced filtering
- Get current fees across all supported chains
- Check supported blockchain networks
- Retrieve real-time protocol statistics

### 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `search_docs` | Search UniVoucher documentation |
| `query_api_cards` | Query gift cards from the protocol |
| `get_single_card` | Get details of a specific card |
| `get_current_fees` | Get current protocol fees |
| `get_chains` | Get supported blockchain networks |
| `get_fee_history` | Get historical fee data |

## Example Usage

Once configured, you can ask your AI assistant:

- "How many cards are in the UniVoucher protocol?"
- "What are the current fees on Ethereum?"
- "Show me how to create a gift card using UniVoucher"
- "Which blockchains does UniVoucher support?"
- "What security measures should I implement when integrating UniVoucher?"

## Support

- **GitHub**: [UniVoucher MCP Issues](https://github.com/UniVoucher/UniVoucher-MCP/issues)
- **Telegram**: [UniVoucher Community](https://t.me/univoucher)
- **Documentation**: [docs.univoucher.com](https://docs.univoucher.com)
- **API**: [api.univoucher.com](https://api.univoucher.com)

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for the UniVoucher ecosystem 