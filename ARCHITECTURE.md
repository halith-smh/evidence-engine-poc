# System Architecture Diagrams

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (Browser)                     │
│                     http://localhost:3000                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      REACT FRONTEND (Vite)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐                │
│  │   Login     │  │  Creator    │  │  Approver    │                │
│  │  Switcher   │  │    View     │  │    View      │                │
│  └─────────────┘  └─────────────┘  └──────────────┘                │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │  Completed  │  │   Wallet    │                                  │
│  │    View     │  │    Info     │                                  │
│  └─────────────┘  └─────────────┘                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Axios HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                   NODE.JS BACKEND (Express)                          │
│                    http://localhost:5000                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API ROUTES                               │  │
│  │  /create-request  /sign-request  /download  /verify          │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                           │
│  ┌──────────────────────▼───────────────────────────────────────┐  │
│  │                  SERVICE LAYER                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │  │
│  │  │Certificate │  │    PDF     │  │      Solana            │ │  │
│  │  │  Service   │  │  Service   │  │      Service           │ │  │
│  │  │            │  │            │  │                        │ │  │
│  │  │ • Generate │  │ • Visual   │  │ • Initialize Wallet   │ │  │
│  │  │   X.509    │  │   Stamps   │  │ • Request Airdrop     │ │  │
│  │  │ • Create   │  │ • P12      │  │ • Anchor Hash         │ │  │
│  │  │   P12      │  │   Signing  │  │ • Verify TX           │ │  │
│  │  │            │  │ • Hash     │  │                        │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────┬───────────────────────────────────┬───────────────────────┘
           │                                   │
           │ Mongoose ODM                      │ Web3.js
           │                                   │
┌──────────▼──────────┐              ┌─────────▼────────────────────┐
│    MONGODB 7.0      │              │   SOLANA DEVNET              │
│  Port: 27017        │              │   Memo Program               │
│                     │              │                              │
│  ┌───────────────┐  │              │  ┌────────────────────────┐ │
│  │  Collections  │  │              │  │  Transactions          │ │
│  │               │  │              │  │  • Hash in Memo        │ │
│  │  • requests   │  │              │  │  • Timestamp           │ │
│  │               │  │              │  │  • Public Explorer     │ │
│  └───────────────┘  │              │  └────────────────────────┘ │
└─────────────────────┘              └──────────────────────────────┘
```

---

## Docker Container Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                            │
│                   (chain-custody-network)                            │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐ │
│  │   Frontend         │  │   Backend          │  │   MongoDB    │ │
│  │   Container        │  │   Container        │  │   Container  │ │
│  │                    │  │                    │  │              │ │
│  │ Image: node:18     │  │ Image: node:18     │  │ Image:       │ │
│  │ Port: 3000         │  │ Port: 5000         │  │   mongo:7.0  │ │
│  │                    │  │                    │  │ Port: 27017  │ │
│  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │              │ │
│  │ │ React + Vite   │ │  │ │ Express Server │ │  │ Volume:      │ │
│  │ │ TailwindCSS    │ │  │ │ Services       │ │  │ mongo-data   │ │
│  │ │ Axios          │ │  │ │ Models         │ │  │              │ │
│  │ └────────────────┘ │  │ └────────────────┘ │  │              │ │
│  │                    │  │                    │  │              │ │
│  │ Proxy: /api →      │  │ Volumes:           │  │ Health:      │ │
│  │   backend:5000     │  │ • uploads/         │  │ Check        │ │
│  │                    │  │ • wallet.json      │  │ Enabled      │ │
│  └────────────────────┘  └────────────────────┘  └──────────────┘ │
│           │                      │                      │          │
│           └──────────────────────┴──────────────────────┘          │
│                     Internal DNS Resolution                        │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ Port Mapping
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HOST MACHINE                                 │
│                                                                      │
│  localhost:3000 ──► Frontend Container                              │
│  localhost:5000 ──► Backend Container                               │
│  localhost:27017 ──► MongoDB Container                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Document Signing Flow

```
┌─────────────┐
│   ALICE     │  (Initiator)
│ (Creator)   │
└──────┬──────┘
       │
       │ 1. Login
       ▼
┌─────────────────────┐
│  Create Request     │
│  • Upload PDF       │
│  • Add Approvers    │
│  • Set Coordinates  │
└──────┬──────────────┘
       │
       │ 2. POST /create-request
       ▼
┌─────────────────────┐
│   Save to MongoDB   │
│   Status: pending   │
└──────┬──────────────┘
       │
       │ 3. Bob receives notification
       ▼
┌─────────────┐
│     BOB     │  (Approver 1)
└──────┬──────┘
       │
       │ 4. Login & View Document
       │ 5. Click "Sign"
       ▼
┌─────────────────────────────┐
│  POST /sign-request         │
│  • Load PDF                 │
│  • Add Visual Stamp at (x,y)│
│  • Update DB: Bob.signed=true│
│  • Status: in-progress      │
└──────┬──────────────────────┘
       │
       │ 6. Diana receives notification
       ▼
┌─────────────┐
│   DIANA     │  (Approver 2 - Final)
└──────┬──────┘
       │
       │ 7. Login & View Document
       │ 8. Click "Sign"
       ▼
┌─────────────────────────────────────────┐
│  POST /sign-request (Final Approver)    │
│                                         │
│  STEP 1: Visual Signature               │
│  • Load PDF                             │
│  • Add stamp at Diana's (x,y)           │
│                                         │
│  STEP 2: Cryptographic Seal             │
│  • Apply P12 signature                  │
│  • Embed certificate                    │
│                                         │
│  STEP 3: Calculate Hash                 │
│  • SHA-256 of sealed PDF                │
│                                         │
│  STEP 4: Blockchain Anchor              │
│  • Create Memo instruction              │
│  • Send transaction to Solana           │
│  • Get TX signature                     │
│                                         │
│  STEP 5: Update Database                │
│  • Diana.signed = true                  │
│  • Status = completed                   │
│  • blockchainTx = signature             │
│  • finalPdfHash = hash                  │
└──────┬──────────────────────────────────┘
       │
       │ 9. Document Finalized
       ▼
┌─────────────────────────────────────────┐
│         COMPLETED DOCUMENT              │
│                                         │
│  ✓ Visual Stamps (All Approvers)       │
│  ✓ P12 Digital Signature                │
│  ✓ Blockchain Transaction               │
│  ✓ Immutable Audit Trail                │
└─────────────────────────────────────────┘
```

---

## Data Flow: Create Request

```
Frontend                Backend               Database            Storage
   │                       │                     │                  │
   │ 1. Upload PDF         │                     │                  │
   │ + Metadata            │                     │                  │
   ├──────────────────────►│                     │                  │
   │                       │                     │                  │
   │                       │ 2. Multer Handles   │                  │
   │                       │    File Upload      │                  │
   │                       ├────────────────────────────────────────►│
   │                       │                     │         Save PDF  │
   │                       │                     │                  │
   │                       │ 3. Create Document  │                  │
   │                       ├────────────────────►│                  │
   │                       │                     │ Save metadata    │
   │                       │                     │ with filename    │
   │                       │                     │                  │
   │                       │ 4. Return Response  │                  │
   │◄──────────────────────┤                     │                  │
   │ {requestId, status}   │                     │                  │
   │                       │                     │                  │
```

---

## Data Flow: Sign Request (Final Approver)

```
Frontend      Backend           PDF Service      Solana Service    Database
   │             │                    │                 │              │
   │ Sign        │                    │                 │              │
   ├────────────►│                    │                 │              │
   │             │                    │                 │              │
   │             │ 1. Get Request     │                 │              │
   │             ├───────────────────────────────────────────────────►│
   │             │◄───────────────────────────────────────────────────┤
   │             │                    │                 │              │
   │             │ 2. Add Visual      │                 │              │
   │             ├───────────────────►│                 │              │
   │             │                    │ pdf-lib draws   │              │
   │             │◄───────────────────┤                 │              │
   │             │                    │                 │              │
   │             │ 3. Apply P12       │                 │              │
   │             ├───────────────────►│                 │              │
   │             │                    │ node-signpdf    │              │
   │             │◄───────────────────┤                 │              │
   │             │                    │                 │              │
   │             │ 4. Calculate Hash  │                 │              │
   │             ├───────────────────►│                 │              │
   │             │◄───────────────────┤                 │              │
   │             │      SHA-256       │                 │              │
   │             │                    │                 │              │
   │             │ 5. Anchor to Chain │                 │              │
   │             ├────────────────────────────────────►│              │
   │             │                    │    Memo Program │              │
   │             │                    │    Transaction  │              │
   │             │◄────────────────────────────────────┤              │
   │             │      TX Signature  │                 │              │
   │             │                    │                 │              │
   │             │ 6. Update Database │                 │              │
   │             ├───────────────────────────────────────────────────►│
   │             │                    │                 │   Status:    │
   │             │                    │                 │   completed  │
   │             │                    │                 │              │
   │◄────────────┤ 7. Success         │                 │              │
   │  {finalized,│                    │                 │              │
   │   txSignature}                   │                 │              │
```

---

## Security Layers Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORIGINAL PDF DOCUMENT                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ Signature Request
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: VISUAL SIGNATURES                        │
│                                                                      │
│  Implementation: pdfService.addVisualSignature()                     │
│  Technology: pdf-lib                                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Signed by: bob@example.com                                  │  │
│  │  2024-01-15T10:30:00.000Z                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Signed by: diana@example.com                                │  │
│  │  2024-01-15T14:45:00.000Z                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ✓ Human-readable                                                    │
│  ✓ Timestamp included                                                │
│  ✓ Visible in any PDF viewer                                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ Final Approver Signs
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LAYER 2: CRYPTOGRAPHIC SIGNATURE                    │
│                                                                      │
│  Implementation: pdfService.applyCryptographicSignature()            │
│  Technology: node-signpdf + node-forge                               │
│                                                                      │
│  Certificate Details:                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Issuer: Chain of Custody System                             │  │
│  │  Algorithm: RSA 2048-bit                                      │  │
│  │  Serial Number: 01                                            │  │
│  │  Valid From: 2024-01-01                                       │  │
│  │  Valid Until: 2034-01-01                                      │  │
│  │  Key Usage: Digital Signature, Non-Repudiation               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ✓ Tamper detection                                                  │
│  ✓ Adobe Acrobat compatible                                          │
│  ✓ Certificate validation                                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ Calculate Hash
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   LAYER 3: BLOCKCHAIN ANCHORING                      │
│                                                                      │
│  Implementation: solanaService.anchorHashToBlockchain()              │
│  Technology: @solana/web3.js + Memo Program                          │
│                                                                      │
│  Transaction Data:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Type: CHAIN_OF_CUSTODY                                      │  │
│  │  Request ID: 507f1f77bcf86cd799439011                        │  │
│  │  Request Name: Q4 Financial Review                           │  │
│  │  Hash: 5d41402abc4b2a76b9719d911017c592                      │  │
│  │  Timestamp: 2024-01-15T14:45:00.000Z                         │  │
│  │  Version: 1.0                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Solana Transaction:                                                 │
│  Signature: 3nX8...Kj9L (Base58)                                     │
│  Block: 123456789                                                    │
│  Slot: 987654321                                                     │
│                                                                      │
│  ✓ Immutable record                                                  │
│  ✓ Publicly verifiable                                               │
│  ✓ Timestamp on-chain                                                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FINALIZED DOCUMENT                              │
│                                                                      │
│  ✓ Visual stamps from all approvers                                 │
│  ✓ P12 cryptographic seal                                            │
│  ✓ Blockchain transaction signature                                  │
│  ✓ SHA-256 hash in database                                          │
│  ✓ Complete audit trail                                              │
│  ✓ Tamper-proof & Verifiable                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Startup Sequence

```
1. docker-compose up
         │
         ├─► Start MongoDB Container
         │   • Health check: mongosh ping
         │   • Wait for ready
         │
         ├─► Start Backend Container
         │   │
         │   ├─► Connect to MongoDB
         │   │   ✓ Connection established
         │   │
         │   ├─► Generate X.509 Certificate
         │   │   • RSA 2048-bit keypair
         │   │   • Create certificate
         │   │   • Bundle into P12
         │   │   ✓ Certificate ready
         │   │
         │   ├─► Initialize Solana
         │   │   • Check for wallet.json
         │   │   • Generate if missing
         │   │   • Connect to devnet
         │   │   ✓ Wallet initialized
         │   │
         │   ├─► Check Wallet Balance
         │   │   • Query balance
         │   │   ⚠️  Low balance warning if < 0.001 SOL
         │   │
         │   └─► Start Express Server
         │       ✓ Listening on port 5000
         │
         └─► Start Frontend Container
             • npm run dev (Vite)
             • Proxy /api to backend:5000
             ✓ Listening on port 3000

2. User Action Required
         │
         └─► Request Airdrop
             • POST /request-airdrop
             • Solana devnet sends 2 SOL
             ✓ Ready to anchor documents

3. System Ready
         ✓ All services running
         ✓ Database connected
         ✓ Certificates generated
         ✓ Wallet funded
         ✓ Ready for use
```

---

## Database Schema Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Request Collection                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  _id: ObjectId("507f1f77bcf86cd799439011")                          │
│  name: "Q4 Financial Review"                                         │
│  category: "contract"                                                │
│  filename: "1234567890-contract.pdf"                                 │
│  originalFilename: "contract.pdf"                                    │
│  initiator: "alice@example.com"                                      │
│                                                                      │
│  approvers: [                                                        │
│    {                                                                 │
│      email: "bob@example.com",                                       │
│      x: 50,                                                          │
│      y: 100,                                                         │
│      pageNumber: 0,                                                  │
│      signed: true,                                                   │
│      signedAt: ISODate("2024-01-15T10:30:00Z")                      │
│    },                                                                │
│    {                                                                 │
│      email: "diana@example.com",                                     │
│      x: 50,                                                          │
│      y: 200,                                                         │
│      pageNumber: 0,                                                  │
│      signed: true,                                                   │
│      signedAt: ISODate("2024-01-15T14:45:00Z")                      │
│    }                                                                 │
│  ],                                                                  │
│                                                                      │
│  status: "completed",                                                │
│                                                                      │
│  history: [                                                          │
│    {                                                                 │
│      action: "created",                                              │
│      user: "alice@example.com",                                      │
│      timestamp: ISODate("2024-01-15T09:00:00Z"),                    │
│      details: "Request created with 2 approver(s)"                   │
│    },                                                                │
│    {                                                                 │
│      action: "signed",                                               │
│      user: "bob@example.com",                                        │
│      timestamp: ISODate("2024-01-15T10:30:00Z"),                    │
│      details: "Document signed at coordinates (50, 100)"             │
│    },                                                                │
│    {                                                                 │
│      action: "signed",                                               │
│      user: "diana@example.com",                                      │
│      timestamp: ISODate("2024-01-15T14:45:00Z"),                    │
│      details: "Document signed at coordinates (50, 200)"             │
│    },                                                                │
│    {                                                                 │
│      action: "finalized",                                            │
│      user: "SYSTEM",                                                 │
│      timestamp: ISODate("2024-01-15T14:45:05Z"),                    │
│      details: "Document sealed and anchored to blockchain..."        │
│    }                                                                 │
│  ],                                                                  │
│                                                                      │
│  blockchainTx: "3nX8rQ...Kj9L",                                      │
│  finalPdfHash: "5d41402abc4b2a76b9719d911017c592",                  │
│                                                                      │
│  createdAt: ISODate("2024-01-15T09:00:00Z"),                        │
│  completedAt: ISODate("2024-01-15T14:45:05Z")                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                            │
│                                                                      │
│  React 18 + Vite + TailwindCSS                                       │
│  • Component-based UI                                                │
│  • Responsive design                                                 │
│  • Real-time updates                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Axios HTTP
┌────────────────────────────▼────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
│                                                                      │
│  Express.js REST API                                                 │
│  • Route handlers                                                    │
│  • Middleware (CORS, Multer)                                         │
│  • Request validation                                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                          │
│                                                                      │
│  Services (Separate modules)                                         │
│  • certificateService: X.509 generation                              │
│  • pdfService: Visual + P12 signing                                  │
│  • solanaService: Blockchain integration                             │
└────────────────┬──────────────────────┬────────────────────────────┘
                 │                      │
┌────────────────▼────────────┐  ┌──────▼───────────────────────────┐
│       DATA LAYER            │  │    BLOCKCHAIN LAYER              │
│                             │  │                                  │
│  MongoDB (Mongoose ODM)     │  │  Solana Devnet                   │
│  • Document storage         │  │  • Transaction submission        │
│  • Schema validation        │  │  • Memo Program                  │
│  • Indexes                  │  │  • Public ledger                 │
└─────────────────────────────┘  └──────────────────────────────────┘
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalable design
- ✅ Maintainable codebase
- ✅ Clear data flow
- ✅ Security at multiple layers
- ✅ Docker containerization
- ✅ Production-ready structure
