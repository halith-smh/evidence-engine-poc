# Quick Start Guide

## 5-Minute Setup

### Step 1: Start the System (2 minutes)

```bash
cd poc_191125_v2
docker-compose up --build
```

Wait for these messages:
```
✅ MongoDB connected
✅ Certificate generated successfully
✅ Solana initialized on devnet
🌐 Server running on http://localhost:5000
```

### Step 2: Fund the Wallet (1 minute)

Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d '{"amount": 2}'
```

OR visit http://localhost:3000, login as any user, and click "Request Airdrop (2 SOL)" button.

### Step 3: Test the Flow (2 minutes)

1. **Open**: http://localhost:3000

2. **Login as Alice**
   - Click the Alice card

3. **Create a Request**
   - Click "Create Request" tab
   - Name: "Test Contract"
   - Category: "Contract"
   - Upload: Any PDF file
   - Add Approver:
     - Email: `bob@example.com`
     - X: `50`, Y: `100`, Page: `0`
   - Add Approver:
     - Email: `diana@example.com`
     - X: `50`, Y: `200`, Page: `0`
   - Click "Create Request"

4. **Sign as Bob**
   - Click "Logout"
   - Login as Bob
   - See "Pending Your Signature (1)"
   - Click "Sign Document"
   - Confirm

5. **Sign as Diana (Final Signature)**
   - Click "Logout"
   - Login as Diana
   - Click "Sign Document"
   - Confirm
   - **Watch the magic!** System will:
     - Add visual signature
     - Apply P12 crypto signature
     - Calculate hash
     - Anchor to Solana blockchain
     - Show transaction signature

6. **Verify the Result**
   - Click "Completed" tab
   - See blockchain transaction
   - Click "View on Solana Explorer"
   - Click "Download Final PDF"
   - Open in Adobe Acrobat Reader
   - See visual stamps and signature panel

## Done! 🎉

You now have:
- ✅ Visual signatures at custom coordinates
- ✅ Cryptographic P12 digital signature
- ✅ Immutable blockchain record on Solana
- ✅ Complete audit trail

## Troubleshooting

### "Insufficient balance" error
Run the airdrop command again:
```bash
curl -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d '{"amount": 2}'
```

### Can't see signature in PDF
- Download the PDF
- Open in **Adobe Acrobat Reader DC** (desktop app, not browser)
- Look for the blue signature ribbon at the top

### Services won't start
```bash
docker-compose down
docker-compose up --build
```

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture details
- Experiment with different coordinates
- Add more approvers
- Check the blockchain transactions on Solana Explorer

## API Quick Reference

```bash
# Health Check
curl http://localhost:5000/health

# Get Wallet Info
curl http://localhost:5000/wallet-info

# Request Airdrop
curl -X POST http://localhost:5000/request-airdrop \
  -H "Content-Type: application/json" \
  -d '{"amount": 2}'

# Get All Requests
curl http://localhost:5000/requests

# Verify Transaction
curl http://localhost:5000/verify/[TRANSACTION_SIGNATURE]
```

## Stopping the System

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Development Mode

Run services individually (requires local MongoDB):

**Backend:**
```bash
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment Checklist

- [ ] Replace self-signed cert with CA-signed certificate
- [ ] Implement real authentication (JWT, OAuth)
- [ ] Use managed MongoDB with auth
- [ ] Add SSL/TLS certificates
- [ ] Implement rate limiting
- [ ] Use cloud storage for PDFs
- [ ] Add monitoring and logging
- [ ] Implement backup strategy
- [ ] Use Solana mainnet (costs real SOL)
- [ ] Add proper error handling
- [ ] Implement webhook notifications
- [ ] Add email notifications
- [ ] Document compliance requirements
- [ ] Perform security audit
- [ ] Load testing

## Key URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017
- **Health Check**: http://localhost:5000/health
- **Wallet Info**: http://localhost:5000/wallet-info
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section in [README.md](README.md)
3. Verify all prerequisites are met
4. Try restarting: `docker-compose restart`

Happy signing! 📝🔐⛓️
