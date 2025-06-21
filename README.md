# UniVoucher MCP Server

A Model Context Protocol (MCP) server that provides access to UniVoucher documentation and API for developers building integrations with the world's first decentralized crypto gift card protocol.

## What is UniVoucher?

UniVoucher is the world's first decentralized tangible crypto gift card protocol that allows users to create and redeem crypto gift cards across multiple blockchains. This MCP server provides developers with easy access to:

- **Complete Documentation**: User guides, technical references, and integration guides
- **Live API Access**: Query cards, fees, chains, and other protocol data
- **Developer Resources**: Everything needed to integrate UniVoucher into your application

## Features

### Documentation Resources
- User guides for creating and redeeming gift cards
- Technical documentation about the protocol
- Developer integration guides
- API reference documentation
- Security best practices

### API Tools
- Query gift cards with advanced filtering
- Get single card details by ID or slot ID
- Check current fees across all chains
- Get fee history for specific chains
- List supported blockchain networks
- Real-time protocol data

### Search Capabilities
- Full-text search across all documentation
- Section-specific search
- Developer-focused content discovery

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Build the Server
```bash
npm run build
```

### Start the Server
```bash
npm start
```

For development:
```bash
npm run dev
```

## Usage

This MCP server provides two main types of resources:

### 1. Documentation Resources
Access comprehensive UniVoucher documentation:
- `univoucher://docs/index` - Main documentation index
- `univoucher://docs/user-guide/*` - User guides
- `univoucher://docs/technical/*` - Technical documentation
- `univoucher://docs/developers/*` - Developer resources

### 2. API Resources
- `univoucher://api/openapi-spec` - Complete OpenAPI specification
- `univoucher://api/endpoints` - List of available endpoints

## Available Tools

### Documentation Tools
- `search_docs` - Search across all documentation with optional section filtering

### API Tools
- `query_api_cards` - Query UniVoucher cards with various filters
- `get_single_card` - Get details of a specific card
- `get_current_fees` - Get current protocol fees
- `get_fee_history` - Get fee update history for chains
- `get_chains` - Get supported blockchain networks

## Configuration

The server connects to the UniVoucher API at `https://api.univoucher.com/v1` by default. The API is completely free and public - no API key required!

## Examples

### Search Documentation
```json
{
  "tool": "search_docs",
  "arguments": {
    "query": "creating gift cards",
    "section": "user-guide"
  }
}
```

### Query Cards
```json
{
  "tool": "query_api_cards",
  "arguments": {
    "status": "active",
    "chain": 1,
    "limit": 10
  }
}
```

### Get Chain Information
```json
{
  "tool": "get_chains",
  "arguments": {
    "chain": 56
  }
}
```

## Integration Guide

This MCP server is perfect for:

1. **IDE Integration**: Add UniVoucher context to your development environment
2. **AI Applications**: Provide AI assistants with UniVoucher knowledge
3. **Developer Tools**: Build custom tools with UniVoucher data
4. **Documentation Bots**: Create support bots with comprehensive UniVoucher knowledge

## Supported IDE/AI Applications

- Cursor
- VS Code (with MCP extension)
- Claude Desktop
- Any MCP-compatible application

## API Reference

The server exposes the complete UniVoucher API through MCP tools. The API provides:

- **Cards**: Query, filter, and retrieve gift card data
- **Fees**: Current and historical fee information
- **Chains**: Supported blockchain networks
- **Health**: API status and connectivity

All API responses are returned as formatted JSON for easy consumption.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Links

- [UniVoucher Website](https://univoucher.com)
- [UniVoucher Documentation](https://docs.univoucher.com)
- [UniVoucher API](https://api.univoucher.com)
- [Telegram Support](https://t.me/univoucher)

## License

MIT License - see LICENSE file for details

## Support

For support with this MCP server:
- Open an issue on GitHub
- Join our [Telegram Group](https://t.me/univoucher)
- Check the [documentation](https://docs.univoucher.com)

---

Built with ❤️ for the UniVoucher ecosystem 