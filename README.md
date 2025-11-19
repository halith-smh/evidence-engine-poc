# Chain of Custody - Tamper-Proof Auditable Sign-Off System

A production-grade Proof of Concept for a DocuSign-style document signing system with cryptographic sealing and blockchain anchoring on Solana.

## 🎯 Overview

This system provides a complete chain of custody solution with three layers of security:

1. **Visual Signature Stamps** - Each approver's signature is visually stamped at specified coordinates with timestamps
2. **Cryptographic P12 Digital Signatures** - Self-signed X.509 certificates applied to PDFs (viewable in Adobe Acrobat)
3. **Blockchain Anchoring** - SHA-256 hash of the final sealed document permanently recorded on Solana Devnet

## 🏗️ Architecture

### Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React 18 + Vite + TailwindCSS
- **Database**: MongoDB 7.0
- **Blockchain**: Solana Devnet (@solana/web3.js)
- **PDF Processing**: pdf-lib (visual stamps), node-signpdf (crypto signatures), node-forge (cert generation)
- **Infrastructure**: Docker + Docker Compose

### System Flow

```
1. Alice (Initiator):
   ├─ Creates request with PDF
   ├─ Adds approvers (Bob, Diana)
   └─ Specifies signature coordinates for each

2. Bob (Approver 1):
   ├─ Logs in and views document
   ├─ Clicks "Sign"
   └─ System stamps signature at specified (x,y)

3. Diana (Approver 2 - Final):
   ├─ Logs in and views document
   ├─ Clicks "Sign"
   └─ System executes finalization:
       ├─ Stamps visual signature
       ├─ Applies P12 cryptographic signature
       ├─ Calculates SHA-256 hash
       └─ Anchors hash to Solana via Memo Program

4. Result:
   └─ Tamper-proof document with verifiable blockchain record
```

## 📁 Project Structure

```
poc_191125_v2/
├── backend/
│   ├── models/
│   │   └── Request.js              # Mongoose schema
│   ├── services/
│   │   ├── certificateService.js   # X.509 cert generation
│   │   ├── pdfService.js           # PDF stamping & signing
│   │   └── solanaService.js        # Blockchain integration
│   ├── server.js                   # Express API server
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginSwitcher.jsx
│   │   │   ├── CreatorView.jsx
│   │   │   ├── ApproverView.jsx
│   │   │   ├── CompletedView.jsx
│   │   │   └── WalletInfo.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM available
- Ports 3000, 5000, and 27017 available

### Installation & Running

1. **Clone or navigate to the project directory:**

```bash
cd poc_191125_v2
```

2. **Start all services with Docker Compose:**

```bash
docker-compose up --build
```

This will:
- Build the backend and frontend containers
- Start MongoDB
- Initialize the Solana wallet
- Generate self-signed X.509 certificate
- Start all services

3. **Wait for initialization (30-60 seconds):**

You should see logs indicating:
```
✅ MongoDB connected
✅ Certificate generated successfully
✅ Solana initialized on devnet
📍 Wallet Address: [your-wallet-address]
💰 Current wallet balance: 0 SOL
⚠️  WARNING: Low balance! Use POST /request-airdrop to fund the wallet
```

4. **Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 💰 CRITICAL: Request SOL Airdrop

**IMPORTANT**: Before signing any documents, you MUST fund the Solana wallet to enable blockchain anchoring.

### Option 1: Using the Frontend UI (Recommended)

1. Log in as any user (Alice, Bob, or Diana)
2. Look for the yellow "Low balance" banner at the top
3. Click the **"Request Airdrop (2 SOL)"** button
4. Wait for confirmation (usually 10-30 seconds)
5. The banner will turn green showing your new balance

### Option 2: Using cURL

```bash
curl -X POST http://localhost:5000/request-airdrop \
  -H "Content-Type: application/json" \
  -d '{"amount": 2}'
```

### Option 3: Using Postman

```
POST http://localhost:5000/request-airdrop
Content-Type: application/json

{
  "amount": 2
}
```

### Verify the Airdrop

Check wallet balance:

```bash
curl http://localhost:5000/wallet-info
```

Expected response:
```json
{
  "address": "8xK...",
  "balance": "2 SOL",
  "network": "devnet",
  "explorerUrl": "https://explorer.solana.com/address/..."
}
```

## 📖 User Guide

### Mock Users

The system provides three mock users:

| Name  | Email              | Role      | Purpose                          |
|-------|-------------------|-----------|----------------------------------|
| Alice | alice@example.com | Initiator | Creates and uploads documents    |
| Bob   | bob@example.com   | Approver  | Signs documents                  |
| Diana | diana@example.com | Approver  | Signs documents                  |

### Creating a Request (Alice)

1. Log in as **Alice**
2. Click **"Create Request"** tab
3. Fill in the form:
   - **Request Name**: e.g., "Q4 Contract Review"
   - **Category**: Select appropriate category
   - **Upload PDF**: Select your PDF file
   - **Add Approvers**:
     - Email: `bob@example.com`
     - X Coordinate: `50` (pixels from left)
     - Y Coordinate: `100` (pixels from top)
     - Page Number: `0` (first page)
   - Click **"+ Add Approver"** for Diana:
     - Email: `diana@example.com`
     - X: `50`, Y: `200`, Page: `0`
4. Click **"Create Request"**

**Note on Coordinates**:
- Coordinates are measured from the top-left corner
- Typical signature areas: X: 50-400, Y: 100-600
- Each approver gets a 200x40px signature box

### Signing Documents (Bob/Diana)

1. Log out from Alice's account
2. Log in as **Bob**
3. View **"Pending Your Signature"** section
4. Click **"View Document"** to preview
5. Click **"Sign Document"**
6. Confirm the action
7. The document is updated with Bob's visual signature

**For the Final Approver (Diana)**:
1. Log in as **Diana**
2. Sign the document
3. The system will automatically:
   - Add Diana's visual signature
   - Apply the P12 cryptographic signature
   - Calculate the SHA-256 hash
   - Send a transaction to Solana
   - Display the blockchain transaction signature

### Viewing Completed Documents

1. Click the **"Completed"** tab
2. View the finalized document details:
   - Blockchain transaction signature
   - PDF hash (SHA-256)
   - Signature timeline
   - Link to Solana Explorer
3. Click **"Download Final PDF"** to get the sealed document

## 🔐 Verifying Digital Signatures

### In Adobe Acrobat Reader

1. Download the completed PDF
2. Open in **Adobe Acrobat Reader DC** (NOT in a browser)
3. You will see:
   - Visual signature stamps for each approver
   - A signature panel (usually a blue ribbon at the top)
4. Click the signature panel to view:
   - Certificate details
   - Signer information
   - Signing time
   - Document integrity status

**⚠️ Expected Warning**:
Since this is a self-signed certificate, you'll see:
> "The signature is invalid. The authenticity of the signer could not be verified."

This is **normal for the PoC**. In production, you would use a certificate from a trusted CA.

### To Trust the Certificate (Optional)

1. Right-click the signature panel
2. Select **"Signature Properties"**
3. Click **"Show Certificate"**
4. Click **"Trust"** tab
5. Check **"Use this certificate as a trusted root"**
6. Click **"OK"**
7. Reopen the document - the warning should be gone

### On Solana Blockchain

1. Copy the transaction signature from the Completed view
2. Visit: https://explorer.solana.com/?cluster=devnet
3. Paste the signature in the search bar
4. Verify:
   - Transaction status: Success ✓
   - Memo Program instruction with your document hash
   - Timestamp matches the completion time

## 🛠️ API Documentation

### Core Endpoints

#### Health Check
```bash
GET /health
```
Returns system status, MongoDB connection, Solana wallet info, and certificate status.

#### Request Airdrop
```bash
POST /request-airdrop
Body: { "amount": 2 }
```
Funds the wallet with Devnet SOL (required before document finalization).

#### Create Request
```bash
POST /create-request
Content-Type: multipart/form-data

Fields:
- name: string (required)
- category: string (required)
- initiator: email (required)
- pdf: file (required)
- approvers: JSON string (required)
  [
    {
      "email": "bob@example.com",
      "x": 50,
      "y": 100,
      "pageNumber": 0
    }
  ]
```

#### Sign Request
```bash
POST /sign-request
Body:
{
  "requestId": "...",
  "signerEmail": "bob@example.com"
}
```

#### Get Requests for User
```bash
GET /requests/:email
```

#### Download PDF
```bash
GET /download/:requestId
```

#### Verify Blockchain Transaction
```bash
GET /verify/:signature
```

## 🔍 Testing the Complete Flow

### End-to-End Test

1. **Fund the Wallet**:
```bash
curl -X POST http://localhost:5000/request-airdrop -H "Content-Type: application/json" -d '{"amount": 2}'
```

2. **Create a Request** (via Frontend as Alice):
   - Upload a test PDF
   - Add Bob and Diana as approvers
   - Set coordinates: Bob (50, 100), Diana (50, 200)

3. **Sign as Bob**:
   - Log in as Bob
   - Sign the pending document

4. **Sign as Diana** (Final Approver):
   - Log in as Diana
   - Sign the document
   - System finalizes and anchors to blockchain

5. **Verify**:
   - Check the Completed tab
   - Download the PDF
   - Open in Adobe Acrobat to see signatures
   - Visit Solana Explorer to verify the blockchain transaction

## 📊 Database Schema

### Request Collection

```javascript
{
  name: String,              // Request name
  category: String,          // Document category
  filename: String,          // Stored filename
  originalFilename: String,  // Original upload name
  initiator: String,         // Creator email
  approvers: [
    {
      email: String,
      x: Number,             // Signature X coordinate
      y: Number,             // Signature Y coordinate
      pageNumber: Number,    // PDF page (0-indexed)
      signed: Boolean,
      signedAt: Date
    }
  ],
  status: String,            // 'pending' | 'in-progress' | 'completed'
  history: [
    {
      action: String,
      user: String,
      timestamp: Date,
      details: String
    }
  ],
  blockchainTx: String,      // Solana transaction signature
  finalPdfHash: String,      // SHA-256 of sealed PDF
  createdAt: Date,
  completedAt: Date
}
```

## 🐛 Troubleshooting

### Issue: "Insufficient balance" error when finalizing

**Solution**: Request an airdrop first (see section above)

### Issue: MongoDB connection failed

**Solution**:
```bash
docker-compose down
docker-compose up --build
```

### Issue: Frontend can't connect to backend

**Solution**: Check if all services are running:
```bash
docker-compose ps
```

All services should show "Up" status.

### Issue: PDF signature not visible in browser

**Solution**: Download the PDF and open it in Adobe Acrobat Reader DC (desktop application). Browser PDF viewers don't display cryptographic signatures.

### Issue: Solana transaction fails

**Possible causes**:
1. Insufficient balance - request airdrop
2. Network congestion - retry after a few seconds
3. Devnet is down - check https://status.solana.com

### Issue: Docker build fails on Windows

**Solution**: Ensure Docker Desktop is using WSL 2 backend and has sufficient resources allocated (4GB+ RAM).

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/chain_of_custody
SOLANA_NETWORK=devnet
NODE_ENV=production
```

### Changing Solana Network

To use mainnet (NOT recommended for PoC):
1. Change `SOLANA_NETWORK=mainnet-beta` in `.env`
2. Fund the wallet with real SOL (costs money!)
3. Rebuild containers

## 📦 Production Considerations

This is a PoC. For production deployment, consider:

1. **Certificate Authority**: Use a trusted CA certificate instead of self-signed
2. **Wallet Security**: Use hardware wallets or secure key management systems
3. **Authentication**: Implement real JWT-based authentication
4. **File Storage**: Use S3 or similar cloud storage instead of local filesystem
5. **Database**: Use managed MongoDB with authentication and encryption
6. **HTTPS**: Add SSL/TLS certificates
7. **Rate Limiting**: Implement API rate limiting
8. **Logging**: Add structured logging and monitoring
9. **Backup**: Implement database and file backups
10. **Scaling**: Use Kubernetes or similar orchestration for horizontal scaling

## 📝 License

MIT

## 🤝 Support

For issues or questions:
- Check the Troubleshooting section above
- Review Docker logs: `docker-compose logs -f`
- Check Solana Devnet status: https://status.solana.com

## 🎉 Summary

You now have a fully functional, containerized, blockchain-anchored document signing system with:

- ✅ Visual signature stamps at custom coordinates
- ✅ Cryptographic P12 digital signatures
- ✅ Immutable blockchain anchoring on Solana
- ✅ Complete audit trail
- ✅ Docker-based deployment
- ✅ Production-grade code structure

**Next Steps**: Run `docker-compose up`, request an airdrop, and start signing documents!
