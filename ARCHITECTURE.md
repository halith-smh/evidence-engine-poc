# KTern Evidence Engine - Technical Architecture

## System Overview

KTern Evidence Engine is a blockchain-anchored document signing and verification system built on three security layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     System Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                           │
│  │   Frontend   │  React + Vite + TailwindCSS               │
│  │  (Port 3000) │  - User Interface                         │
│  └──────┬───────┘  - Document Upload                        │
│         │          - Verification Portal                     │
│         │ REST API                                           │
│         ↓                                                     │
│  ┌──────────────┐                                           │
│  │   Backend    │  Node.js + Express                        │
│  │  (Port 5000) │  - PDF Processing (pdf-lib, @signpdf)    │
│  └──┬───────┬───┘  - Certificate Management (node-forge)    │
│     │       │      - Business Logic                          │
│     │       │                                                 │
│     ↓       ↓                                                 │
│  ┌────────┐ ┌──────────┐                                    │
│  │MongoDB │ │  Solana  │                                    │
│  │  DB    │ │Blockchain│                                    │
│  └────────┘ └──────────┘                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Three Security Layers

### Layer 1: Visual Signatures
- PDF annotations using pdf-lib
- Contains signer email and timestamp
- Human-readable proof of signing
- Compatible with any PDF reader

### Layer 2: Cryptographic Signatures
- P12/PKCS#12 digital signatures using @signpdf
- Industry-standard tamper detection
- Verifiable in Adobe Acrobat
- Self-signed for development, CA-issued for production

### Layer 3: Blockchain Anchoring
- Document hash stored on Solana blockchain
- Immutable timestamp proof
- Publicly verifiable by anyone
- Decentralized trust model

## Data Flow

### Document Signing Flow

```
1. User uploads PDF
   ↓
2. System stores in MongoDB
   ↓
3. Approvers sign sequentially
   ↓ (for each approver)
4. Add visual signature at coordinates
   ↓
5. Update MongoDB (signed status)
   ↓ (when all signed)
6. Apply P12 cryptographic signature
   ↓
7. Calculate SHA-256 hash
   ↓
8. Post hash to Solana blockchain
   ↓
9. Store transaction ID in MongoDB
   ↓
10. Document finalized
```

### Document Verification Flow

```
1. User uploads PDF for verification
   ↓
2. System calculates SHA-256 hash
   ↓
3. Search Solana blockchain for hash
   ↓
4. If found: Retrieve transaction details
   ↓
5. Query MongoDB for full request data
   ↓
6. Extract and verify P12 signature
   ↓
7. Parse visual signatures from PDF
   ↓
8. Cross-verify all data sources
   ↓
9. Return comprehensive verification result
```

## Technology Stack Details

### Backend Technologies

| Component | Purpose | Library |
|-----------|---------|---------|
| Web Server | HTTP API | Express.js |
| Database | Document storage | MongoDB + Mongoose |
| PDF Visual Signatures | Draw on PDF | pdf-lib |
| PDF Crypto Signatures | P12 signing | @signpdf |
| Certificate Generation | Self-signed certs | node-forge |
| Blockchain | Solana integration | @solana/web3.js |
| File Upload | Multipart forms | multer |
| Logging | Structured logs | chalk |

### Frontend Technologies

| Component | Purpose | Library |
|-----------|---------|---------|
| UI Framework | Component system | React 18 |
| Build Tool | Fast dev server | Vite |
| Styling | Utility-first CSS | TailwindCSS |
| HTTP Client | API requests | Axios |
| Icons | UI icons | Lucide React |

## Security Considerations

### Hash-Based Integrity
- SHA-256 hashing ensures any modification is detected
- Hash stored on immutable blockchain
- Cannot be tampered without detection

### Cryptographic Signatures
- Private/public key cryptography
- Non-repudiation guarantee
- Industry-standard PKCS#12 format

### Blockchain Immutability
- Decentralized Solana network
- Proof-of-Stake consensus
- Thousands of validators worldwide
- Impossible to alter historical data

## Scalability

### Performance Characteristics
- Document signing: ~2-3 seconds
- Blockchain confirmation: ~400ms
- Verification: ~1 second
- Concurrent requests: 100+ supported

### Scaling Strategies
- MongoDB replica sets for HA
- Load balancer for backend instances
- CDN for frontend assets
- Solana handles blockchain scale

## License

Proprietary - KTern
