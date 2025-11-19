# Project Structure

## Complete File Tree

```
poc_191125_v2/
│
├── 📄 package.json                    # Backend dependencies
├── 📄 .env                            # Environment configuration
├── 📄 .env.example                    # Example environment file
├── 📄 .gitignore                      # Git ignore rules
├── 📄 .dockerignore                   # Docker ignore rules
├── 📄 Dockerfile                      # Backend container config
├── 📄 docker-compose.yml              # Multi-container orchestration
├── 📄 server.js                       # Main Express server
├── 📄 README.md                       # Complete documentation
├── 📄 PROJECT_STRUCTURE.md            # This file
│
├── 📁 models/
│   └── 📄 Request.js                  # Mongoose schema for requests
│
├── 📁 services/
│   ├── 📄 certificateService.js       # X.509 certificate generation
│   ├── 📄 pdfService.js               # PDF stamping & P12 signing
│   └── 📄 solanaService.js            # Blockchain integration
│
├── 📁 uploads/                        # PDF storage (auto-created)
│   └── [uploaded PDFs stored here]
│
├── 📄 wallet.json                     # Solana keypair (auto-generated)
│
└── 📁 frontend/
    ├── 📄 package.json                # Frontend dependencies
    ├── 📄 vite.config.js              # Vite configuration
    ├── 📄 tailwind.config.js          # TailwindCSS config
    ├── 📄 postcss.config.js           # PostCSS config
    ├── 📄 Dockerfile                  # Frontend container config
    ├── 📄 index.html                  # HTML entry point
    │
    └── 📁 src/
        ├── 📄 main.jsx                # React entry point
        ├── 📄 App.jsx                 # Main application component
        ├── 📄 index.css               # Global styles with Tailwind
        │
        └── 📁 components/
            ├── 📄 LoginSwitcher.jsx   # Mock authentication
            ├── 📄 CreatorView.jsx     # Document creation form
            ├── 📄 ApproverView.jsx    # Signature dashboard
            ├── 📄 CompletedView.jsx   # Finalized documents
            └── 📄 WalletInfo.jsx      # Solana wallet banner
```

## Component Architecture

### Backend Services

#### 1. **certificateService.js**
- Generates self-signed X.509 certificates
- Creates P12 (PKCS#12) bundles
- Provides certificate for PDF signing
- Uses node-forge for cryptographic operations

#### 2. **pdfService.js**
- Adds visual signature stamps at coordinates
- Applies P12 cryptographic signatures
- Calculates SHA-256 hashes
- Uses pdf-lib and node-signpdf

#### 3. **solanaService.js**
- Initializes Solana connection
- Manages wallet keypair
- Anchors hashes via Memo Program
- Provides transaction verification

### Frontend Components

#### 1. **LoginSwitcher.jsx**
- Mock authentication UI
- Three user personas (Alice, Bob, Diana)
- System features overview

#### 2. **CreatorView.jsx**
- PDF upload form
- Approver management
- Coordinate mapping interface
- Request creation logic

#### 3. **ApproverView.jsx**
- Pending signatures list
- Initiated requests tracking
- Sign document interface
- Progress visualization

#### 4. **CompletedView.jsx**
- Finalized documents display
- Blockchain verification links
- Signature timeline
- Download and verification instructions

#### 5. **WalletInfo.jsx**
- Wallet balance display
- Airdrop request button
- Low balance warning
- Solana Explorer link

## Data Flow

### Request Creation Flow
```
User (Alice)
    ↓
CreatorView Component
    ↓
POST /create-request (with multipart/form-data)
    ↓
Express + Multer (file upload)
    ↓
MongoDB (Request document)
    ↓
Response to Frontend
```

### Signature Flow
```
User (Bob/Diana)
    ↓
ApproverView Component
    ↓
POST /sign-request
    ↓
pdfService.addVisualSignature()
    ↓
Check if all signed
    ↓
If YES → Finalization:
    ├─ pdfService.applyCryptographicSignature()
    ├─ pdfService.calculatePdfHash()
    └─ solanaService.anchorHashToBlockchain()
    ↓
MongoDB Update
    ↓
Response to Frontend
```

## Docker Architecture

### Services

1. **mongo** (MongoDB 7.0)
   - Port: 27017
   - Volume: mongo-data
   - Health check enabled

2. **backend** (Node.js + Express)
   - Port: 5000
   - Depends on: mongo
   - Volumes: uploads, wallet.json
   - Auto-restart enabled

3. **frontend** (React + Vite)
   - Port: 3000
   - Depends on: backend
   - Proxy: /api → backend:5000

### Network
- Custom bridge network: `chain-custody-network`
- All services communicate via internal DNS

## Key Technologies

### Backend Stack
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **Multer**: File upload handling
- **pdf-lib**: PDF manipulation
- **node-signpdf**: Digital signatures
- **node-forge**: X.509 certificate generation
- **@solana/web3.js**: Blockchain integration

### Frontend Stack
- **React 18**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Axios**: HTTP client

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Orchestration
- **MongoDB**: Document database
- **Solana Devnet**: Blockchain network

## Security Layers

### Layer 1: Visual Signatures
- Rendered using pdf-lib
- Positioned at user-specified coordinates
- Include timestamp and signer email
- Visible in all PDF viewers

### Layer 2: Cryptographic Signatures
- P12 certificate with private key
- RSA 2048-bit encryption
- Self-signed (PoC) or CA-signed (production)
- Verifiable in Adobe Acrobat

### Layer 3: Blockchain Anchoring
- SHA-256 hash of final PDF
- Stored on Solana via Memo Program
- Immutable and publicly verifiable
- Timestamped on-chain

## Environment Configuration

### Backend Environment
```env
PORT=5000                                           # API server port
MONGODB_URI=mongodb://mongo:27017/chain_of_custody # Database connection
SOLANA_NETWORK=devnet                              # Blockchain network
NODE_ENV=production                                # Runtime environment
```

### Frontend Environment
```env
VITE_API_URL=http://localhost:5000                 # Backend API URL
```

## File Storage

### Uploads Directory
- Created automatically on startup
- Stores original and signed PDFs
- Mounted as Docker volume for persistence
- File naming: `{timestamp}-{random}-{original_name}.pdf`

### Wallet File
- Generated on first run
- Contains Solana keypair (64 bytes)
- Persisted across container restarts
- Must be backed up for production

## API Endpoints Summary

| Method | Endpoint              | Purpose                           |
|--------|-----------------------|-----------------------------------|
| GET    | /health               | System health check               |
| POST   | /request-airdrop      | Fund wallet with devnet SOL       |
| GET    | /wallet-info          | Get wallet balance and address    |
| POST   | /create-request       | Create new document request       |
| GET    | /requests             | Get all requests                  |
| GET    | /requests/:email      | Get user-specific requests        |
| GET    | /request/:id          | Get single request details        |
| POST   | /sign-request         | Sign a document                   |
| GET    | /download/:requestId  | Download final PDF                |
| GET    | /verify/:signature    | Verify blockchain transaction     |
| GET    | /uploads/:filename    | Static file serving               |

## Deployment Workflow

### Development
```bash
docker-compose up --build
```

### Production Considerations
1. Use managed MongoDB (Atlas, etc.)
2. Implement real authentication (JWT, OAuth)
3. Use trusted CA certificates
4. Add SSL/TLS termination (nginx, Traefik)
5. Implement proper secrets management
6. Add monitoring and logging (Prometheus, ELK)
7. Use cloud storage (S3, GCS)
8. Implement rate limiting
9. Add comprehensive error handling
10. Use mainnet with real SOL (costs money)

## Monitoring Points

### Health Checks
- MongoDB: `echo 'db.runCommand("ping").ok' | mongosh`
- Backend: `GET /health`
- Frontend: Port 3000 accessibility

### Key Metrics
- Solana wallet balance
- MongoDB connection status
- PDF processing time
- Blockchain transaction confirmations
- Request completion rate

## Troubleshooting Checkpoints

1. **Startup Issues**
   - Check Docker logs: `docker-compose logs -f`
   - Verify ports are available: 3000, 5000, 27017
   - Ensure sufficient disk space (5GB+)

2. **Blockchain Issues**
   - Check wallet balance: `GET /wallet-info`
   - Request airdrop: `POST /request-airdrop`
   - Verify Solana devnet status

3. **PDF Issues**
   - Check uploads directory permissions
   - Verify PDF file size (<10MB)
   - Ensure valid PDF format

4. **Database Issues**
   - Check MongoDB container: `docker ps`
   - Verify connection: `docker exec -it chain-custody-mongo mongosh`
   - Check data volume: `docker volume ls`

## Development Tips

### Running Locally (Without Docker)

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

**MongoDB:**
```bash
# Start local MongoDB or use connection string
mongod --dbpath ./data
```

### Debugging

**Backend Logs:**
```bash
docker-compose logs -f backend
```

**Frontend Logs:**
```bash
docker-compose logs -f frontend
```

**MongoDB Shell:**
```bash
docker exec -it chain-custody-mongo mongosh
use chain_of_custody
db.requests.find().pretty()
```

## Testing Checklist

- [ ] Docker services start successfully
- [ ] Wallet is generated
- [ ] Certificate is created
- [ ] MongoDB connection works
- [ ] Airdrop successfully funds wallet
- [ ] Alice can create request
- [ ] Bob can sign document
- [ ] Diana triggers finalization
- [ ] P12 signature is applied
- [ ] Hash is anchored to Solana
- [ ] PDF downloads correctly
- [ ] Signature visible in Adobe Acrobat
- [ ] Blockchain transaction is verifiable

## Additional Resources

- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [node-signpdf](https://github.com/vbuch/node-signpdf)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)
