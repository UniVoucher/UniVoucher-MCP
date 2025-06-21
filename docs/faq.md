# Frequently Asked Questions

This page addresses common questions about UniVoucher and its features.

## General Questions

### What is UniVoucher?

UniVoucher is a decentralized protocol for creating cryptocurrency tangible gift cards on the major EVM-compatible blockchain. It allows you to create and redeem crypto gift cards in a tangible format of card ID and card secret. The protocol is accessible to anyone worldwide, requires no account registration, and is fully non-custodial.

### How does UniVoucher differ from just sending crypto?

Unlike a direct transfer, UniVoucher:

- Creates a redeemable gift card experience
- Doesn't require the recipient to have a wallet until redemption
- Allows card creators to cancel unredeemed cards
- Provides a better gift-giving experience with messages
- Can be printed as a physical crypto for a hands-on experience.

### Is UniVoucher custodial?

No, UniVoucher is completely non-custodial by design. All funds are held in a smart contract on the blockchain, and no one (not even the UniVoucher team) can access your funds without the card secret. Users always maintain control of their funds, with no registration required - just connect your wallet.

### Which blockchains are supported?

UniVoucher currently supports:

- Ethereum
- Base
- BNB Chain
- Polygon
- Arbitrum
- Optimism
- Avalanche

### Which tokens can I use?

You can use:

- Native tokens of each blockchain (ETH, BNB, AVAX, etc.)
- USDT,USDC, or any ERC-20 token on the supported networks
- Custom tokens by adding their contract address

---

## Card Creation

### How much does it cost to create a card?

Creating a card costs:

- 1% creation fees on the card amount (paid in the same token)
- Gas fees for the blockchain transaction
- No fees for card cancellation or redeemption

### Are there limits on card amounts?

There are no limits on card amounts.

### Can I create multiple cards at once?

Yes, you can create up to 100 cards in a single transaction using the quantity field, which is more gas-efficient than creating them individually.

### How are card secrets generated?

Card secrets are 20-character codes in the format XXXXX-XXXXX-XXXXX-XXXXX. They are:

- Generated using cryptographically secure random generation
- Never stored on the blockchain
- Not recoverable if lost

### What happens if I lose the card secret?

If you lose a card secret:

1. The card cannot be redeemed by anyone
2. Card creator can still cancel the card to recover the funds
3. The card secret cannot be recovered or reset

---

## Card Redemption

### How do recipients redeem a card?

Recipients need:

1. The card ID
2. The card secret
3. A crypto wallet

They visit the UniVoucher website, enter these details, and connect their wallet to receive the funds.

### Can I redeem a card to someone else's wallet?

Yes, when redeeming you can specify any wallet address to receive the funds, not just your connected wallet.

### Do cards expire?

Cards do not expire and can be redeemed at any time unless cancelled by the creator. After 5 years of inactivity, cards are considered abandoned and can be cancelled by the UniVoucher contract owner.

### Is there a fee for redeeming cards?

There is no fee for redeeming cards. The only cost is the gas fee for the blockchain transaction.

### Can I partially redeem a card?

No, cards must be redeemed for their full amount. Partial redemption is not supported.

---

## Card Management

### Can I cancel a card I created?

Yes, as the creator, you can cancel any active (unredeemed) card and reclaim the funds.

### Can I see who redeemed my card?

Yes, when a card is redeemed, the redeeming address is stored and visible in the card details.

### Can I change the message on a card?

No, once a card is created, its message cannot be changed. You would need to cancel the card and create a new one.

### Can I add more funds to an existing card?

No, cards cannot be topped up. You would need to create a new card instead.

### Can I bulk cancel multiple cards?

Yes, in the "My Cards" section you can select multiple cards and cancel them in a single transaction (per network).

---

## Security Questions

### How secure are the card secrets?

Card secrets are very secure:

- 20 random uppercase letters
- Never stored on the blockchain
- Encrypted using PBKDF2 and AES-GCM
- Would take billions of years to brute force

### Can UniVoucher access my funds?

No, UniVoucher cannot access your funds. The smart contract only allows:

- Card redemption with the correct secret
- Card cancellation by the creator
- After 5 years of inactivity, abandoned cards can be cancelled by the UniVoucher contract owner.

### Is the code open source?

Yes, all smart contract code is open source and verified on blockchain explorers. The contract is at address `0x51553818203e38ce0E78e4dA05C07ac779ec5b58` on all supported networks.

### Has the contract been audited?

The contract uses well-established cryptographic patterns and has been thoroughly reviewed. As with any smart contract, users should exercise appropriate caution.

### What happens if the website goes down?

Since UniVoucher is fully decentralized:

- All card data is stored on the blockchain
- Cards can still be redeemed by interacting directly with the smart contract
- Funds remain secure and accessible
- Anyone can build their own interface to interact with the protocol
- No central authority can prevent card redemption

---

## Technical Questions

### How do cross-chain cards work?

Cards are created on specific networks and can only be redeemed on that same network. The card ID includes a network identifier prefix to distinguish between networks.

### Why is network switching required?

Each blockchain operates independently, so you must be connected to the same network where a card was created to interact with it.

### Can I interact with the contract directly?

Yes, advanced users can interact directly with the smart contract. The ABI and technical documentation are available in the [Developer Resources](developers/integration-guide.md).

### What is the 5-year abandonment period?

To prevent permanent fund loss, cards include a 5-year abandonment mechanism:
- Cards unredeemed for 5 years are considered abandoned
- Only then can the contract owner intervene
- This is a safety feature to prevent permanent fund loss

---

## Troubleshooting

### "Card not found" error

This can occur if the card ID was entered incorrectly

### "Invalid card secret" error

This means the entered secret doesn't match the card. Double-check for typos or formatting issues.

### "Transaction failed" during redemption

This usually happens due to:

- Insufficient gas fees in your wallet
- Network congestion
- Wallet connection issues

### Where can I get help if I'm having issues?

For additional support:

- Check the technical documentation for developers
- Join the community [Telegram group](https://t.me/UniVoucherOfficial)

---
