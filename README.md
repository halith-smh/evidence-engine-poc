# KTern Evidence Engine

A blockchain-anchored, tamper-proof document signing and verification system with cryptographic integrity guarantees.

## Overview

KTern Evidence Engine provides enterprise-grade document management with three security layers:

1. **Visual Signatures** - Human-readable PDF annotations with signer email and timestamp
2. **Cryptographic Signatures** - P12/PKCS#12 digital signatures for tamper detection
3. **Blockchain Anchoring** - Immutable proof-of-existence on Solana blockchain

### Key Features

- Multi-approver sequential workflows
- Visual PDF signatures at custom coordinates
- Industry-standard P12 cryptographic signatures
- Blockchain timestamp proof (Solana)
- Public verification portal (no login required)
- Complete audit trail and chain of custody
- In-memory document processing for privacy

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Setup

Create `.env` file in root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ktern_evidence
SOLANA_NETWORK=devnet
NODE_ENV=development
```

### Wallet Setup (IMPORTANT)

**For PoC Testing:**

If you received a `wallet.json` file (pre-funded test wallet):

1. Place `wallet.json` in the root directory
2. Start the application - it will use the existing wallet

**For New Setup:**

The system will automatically create a new wallet. To fund it:
- Option 1: Visit https://faucet.solana.com (RECOMMENDED)
- Option 2: Click "Request Airdrop" button in the UI
- Option 3: Use `solana airdrop 2 <ADDRESS> --url devnet`

📖 **See [WALLET_SETUP.md](WALLET_SETUP.md) for detailed instructions**

### Running the Application

**Option 1: Docker (Recommended)**

The easiest way to run the entire stack:

```bash
# Start all services (MongoDB, Backend, Frontend)
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Rebuild and restart
npm run docker:build
npm run docker:up
```

**Option 2: Manual**

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
npm run dev

# Terminal 3: Start Frontend
cd frontend && npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Docker Commands Reference

```bash
# Start services in background
npm run docker:up

# Start services with logs
docker-compose up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Remove all data (fresh start)
docker-compose down -v
npm run docker:up
```

## Understanding the Technology

### What is a Hash?

A hash is a unique digital fingerprint for any data:

```
Input: "Hello World"
SHA-256 Output: a591a6d40bf420404a011733cfb7b190...

Input: 5MB PDF Document
SHA-256 Output: 3f79bb7b435b05321651daefd374cdc6...
```

**Key Properties:**
- Same input always produces the same hash
- Changing even one character completely changes the hash
- Cannot reverse the hash to get original data
- Virtually impossible for two different inputs to have the same hash

**Why use hashes?**
- Store small hash instead of entire document on blockchain
- Any document modification changes the hash (proof of tampering)
- Hash reveals nothing about document content (privacy)

### What is Blockchain?

A blockchain is a distributed, immutable database:

| Feature | Traditional Database | Blockchain |
|---------|---------------------|------------|
| Control | Centralized (we own it) | Decentralized (no single owner) |
| Modification | Can be changed | Immutable (cannot be changed) |
| Trust | Must trust database owner | Independently verifiable |
| Timestamp | Can be backdated | Cryptographically proven |

**How KTern Uses Blockchain:**

1. Calculate document hash
2. Post hash to Solana blockchain via Memo Program
3. Blockchain timestamp proves document existed at specific time
4. Anyone can verify by searching blockchain for the hash

**Why Solana?**
- Fast confirmation (~400ms)
- Low cost (~$0.0001 per transaction)
- Energy efficient (Proof-of-Stake)
- Thousands of validators worldwide

### Digital Signatures (P12/PKCS#12)

**Concept:**

Every signer has two mathematically linked keys:
- **Private Key**: Secret (like a password)
- **Public Key**: Shared with everyone

**Signing Process:**
```
Document + Private Key → Digital Signature
```

**Verification Process:**
```
Document + Signature + Public Key → Valid ✅ or Invalid ❌
```

**Tamper Detection:**
```
Original Document + Signature = Valid ✅
Modified Document + Signature = Invalid ❌ (hash mismatch)
```

## System Architecture

### Component Overview

```
┌──────────────┐
│   Frontend   │ React + TailwindCSS (Port 3000)
└──────┬───────┘
       │ REST API
       ↓
┌──────────────┐
│   Backend    │ Node.js + Express (Port 5000)
└──┬───────┬───┘
   │       │
   ↓       ↓
┌────────┐ ┌────────┐
│MongoDB │ │ Solana │
│Database│ │Blockchain│
└────────┘ └────────┘
```

### Document Signing Workflow

```
1. INITIATION
   Alice uploads PDF and adds approvers (Bob, Diana)
   System stores request in MongoDB

2. SEQUENTIAL APPROVALS
   Bob signs → Visual signature added at (50, 100)
   Diana signs → Visual signature added at (50, 200)
   
3. AUTOMATIC FINALIZATION (when all signed)
   a. Apply P12 cryptographic signature
   b. Calculate SHA-256 hash of final PDF
   c. Post hash to Solana blockchain
   d. Store blockchain transaction ID
   
4. PUBLIC VERIFICATION
   Anyone uploads PDF → System:
   - Calculates hash of uploaded PDF
   - Searches Solana blockchain for hash
   - Returns: Verified ✅ / Not Found ❌ / Tampered ⚠️
```

## Usage Guide

### 1. Create Signing Request

1. Login as Alice (initiator)
2. Click "Create Request"
3. Upload PDF document
4. Add approvers with signature coordinates:
   - Bob: X=50, Y=100, Page=0
   - Diana: X=50, Y=200, Page=0
5. Submit request

### 2. Sign as Approver

1. Login as Bob
2. Click "Sign Document" on pending request
3. Visual signature automatically added
4. Document status updates to "In Progress"

### 3. Final Approval

1. Login as Diana (final approver)
2. Click "Sign Document"
3. System automatically executes:
   - Adds visual signature
   - Applies P12 cryptographic signature
   - Calculates document hash
   - Posts hash to Solana blockchain
   - Generates transaction ID

### 4. Verify Document

1. Click "Verify Document" tab (no login required)
2. Upload signed PDF
3. View comprehensive verification results:
   - Document hash
   - Blockchain transaction details with explorer link
   - Chain of custody timeline
   - Cryptographic signature status
   - Trust level assessment

## API Reference

### Core Endpoints

**Health Check**
```http
GET /health
```

**Create Request**
```http
POST /create-request
Content-Type: multipart/form-data

name, category, initiator, pdf, approvers
```

**Sign Request**
```http
POST /sign-request

{
  "requestId": "...",
  "signerEmail": "..."
}
```

**Verify Document**
```http
POST /verify-document
Content-Type: multipart/form-data

pdf: <file>
```

**Get Requests**
```http
GET /requests/:email
```

**Download PDF**
```http
GET /download/:requestId
```

For complete API documentation, see the code or use the interactive UI.

## Technology Stack

### Backend
- Node.js 18+ with Express
- MongoDB 6+ for data persistence
- pdf-lib for visual signatures
- @signpdf for cryptographic signatures
- @solana/web3.js for blockchain integration
- node-forge for certificate generation

### Frontend
- React 18 with Vite build tool
- TailwindCSS for styling
- Axios for HTTP requests
- Lucide React for icons

### Infrastructure
- Docker and Docker Compose
- Solana Devnet (testnet)
- File system for document storage

## Production Deployment

See **PRODUCTION.md** for:
- Real P12 certificate setup ($150-600/year from DigiCert/GlobalSign/Sectigo)
- MongoDB replica set configuration
- Solana mainnet migration
- Docker/Kubernetes deployment
- SSL/TLS certificate setup
- Environment variables and security

## Troubleshooting

**MongoDB Connection Failed**
```bash
# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:7
```

**Solana Airdrop Failed**
- Devnet faucet may be rate-limited
- Wait 1 hour and retry
- Or use web faucet: https://faucet.solana.com/

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

**PDF Signing Failed**
- Ensure file is valid PDF (open in Adobe Acrobat)
- Check file size < 10MB
- Verify file not corrupted or encrypted

## Documentation

- **README.md** (this file) - Overview and quick start
- **ARCHITECTURE.md** - Detailed technical architecture
- **PRODUCTION.md** - Production deployment guide

## License

Proprietary - KTern

## Version

**1.0.0** | January 2025 | Production-Ready PoC
