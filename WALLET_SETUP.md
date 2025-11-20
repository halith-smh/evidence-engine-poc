# Wallet Setup Guide

## Using the Test Wallet (Recommended for PoC)

For testing purposes, you can use a pre-funded test wallet instead of requesting airdrops.

### Option 1: Use Provided Test Wallet

If you received a `wallet.json` file from the PoC provider:

1. **Place the wallet file** in the root directory of the project:
   ```
   poc_191125_v2/
   ├── wallet.json          ← Place here
   ├── docker-compose.yml
   ├── server.js
   └── ...
   ```

2. **Rebuild Docker** (if using Docker):
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up
   ```

3. **Verify** - The server logs should show:
   ```
   📂 Loading existing Solana wallet...
   ✅ Solana initialized on devnet
   📍 Wallet Address: <address>
   [INFO] Current wallet balance: X.XXX SOL
   ```

### Option 2: Generate New Wallet & Fund It

If you want to create your own wallet:

1. **Start the system** - A new wallet will be created automatically:
   ```bash
   docker-compose up
   ```

2. **Copy the wallet address** from the logs:
   ```
   📍 Wallet Address: 8XgN2y6z1CGSpWxqKBcbPk4djcZRJzSefb3QtsHYngGv
   ```

3. **Fund the wallet** using one of these methods:

   **A. Web Faucet (RECOMMENDED)**
   - Visit: https://faucet.solana.com
   - Paste your wallet address
   - Click "Request Airdrop"
   - Solve CAPTCHA if required

   **B. CLI Faucet**
   ```bash
   solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
   ```

   **C. UI Button**
   - Log into the app
   - Click "Request Airdrop (2 SOL)" button
   - Note: May be rate-limited

4. **Restart the server** to refresh the balance

## Wallet File Location

The wallet is stored in one of these locations:

- **Root directory**: `./wallet.json` (preferred)
- **Data directory**: `./data/wallet.json` (fallback for Docker volume issues)

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

- The provided `wallet.json` is for **devnet testing only**
- Never commit `wallet.json` to version control (it's in `.gitignore`)
- For production, use a secure key management system
- Consider using environment variables or secret managers

## Troubleshooting

### Balance is 0 SOL
- Fund the wallet using one of the methods above
- If rate-limited (429 error), wait 24 hours or use the web faucet

### Wallet not found
- Ensure `wallet.json` is in the root directory
- Check file permissions
- Rebuild Docker if using containers

### Different wallet address each time
- The system generates a new wallet if `wallet.json` is missing
- Make sure to place the wallet file before starting

## Need Help?

- Check server logs for wallet address and balance
- Visit the in-app Documentation page for architecture details
- Use the web faucet if API airdrop fails
