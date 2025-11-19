# Project Index & Manifest

## Complete File Listing

### 📚 Documentation (5 files)
- [README.md](README.md) - **START HERE** - Complete system documentation (600+ lines)
- [QUICKSTART.md](QUICKSTART.md) - 5-minute getting started guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture and design deep-dive
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive test scenarios
- [DELIVERABLES.md](DELIVERABLES.md) - Project deliverables summary
- [INDEX.md](INDEX.md) - This file

### 🚀 Deployment Scripts (2 files)
- [deploy.sh](deploy.sh) - Unix/Linux/Mac deployment script
- [deploy.bat](deploy.bat) - Windows deployment script

### 🐳 Docker Configuration (3 files)
- [Dockerfile](Dockerfile) - Backend container definition
- [docker-compose.yml](docker-compose.yml) - Multi-container orchestration
- [frontend/Dockerfile](frontend/Dockerfile) - Frontend container definition
- [.dockerignore](.dockerignore) - Docker build exclusions

### ⚙️ Configuration Files (4 files)
- [package.json](package.json) - Backend dependencies
- [.env](.env) - Environment configuration
- [.env.example](.env.example) - Environment template
- [.gitignore](.gitignore) - Git exclusions

### 🔧 Backend Code (4 files)
- [server.js](server.js) - Main Express API server (450+ lines)
- [models/Request.js](models/Request.js) - Mongoose schema
- [services/certificateService.js](services/certificateService.js) - X.509 cert generation
- [services/pdfService.js](services/pdfService.js) - PDF processing (visual + P12)
- [services/solanaService.js](services/solanaService.js) - Blockchain integration

### 🎨 Frontend Code (12 files)
- [frontend/package.json](frontend/package.json) - React dependencies
- [frontend/vite.config.js](frontend/vite.config.js) - Build configuration
- [frontend/tailwind.config.js](frontend/tailwind.config.js) - Styling config
- [frontend/postcss.config.js](frontend/postcss.config.js) - PostCSS config
- [frontend/index.html](frontend/index.html) - HTML entry point
- [frontend/src/main.jsx](frontend/src/main.jsx) - React bootstrap
- [frontend/src/App.jsx](frontend/src/App.jsx) - Main app component
- [frontend/src/index.css](frontend/src/index.css) - Global styles
- [frontend/src/components/LoginSwitcher.jsx](frontend/src/components/LoginSwitcher.jsx) - Auth UI
- [frontend/src/components/CreatorView.jsx](frontend/src/components/CreatorView.jsx) - Document creation
- [frontend/src/components/ApproverView.jsx](frontend/src/components/ApproverView.jsx) - Signature dashboard
- [frontend/src/components/CompletedView.jsx](frontend/src/components/CompletedView.jsx) - Completed docs
- [frontend/src/components/WalletInfo.jsx](frontend/src/components/WalletInfo.jsx) - Wallet banner

### 📊 Total Files: 30+
### 📊 Total Lines of Code: ~4,500+
### 📊 Documentation Lines: ~2,500+

---

## Quick Navigation Guide

### For First-Time Users
1. Read [QUICKSTART.md](QUICKSTART.md) (5 minutes)
2. Run `docker-compose up --build` or `./deploy.sh start`
3. Request airdrop: `./deploy.sh airdrop`
4. Open http://localhost:3000

### For Developers
1. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Study [server.js](server.js) - Main backend logic
3. Check [services/](services/) - Core functionality
4. Review frontend [components/](frontend/src/components/)

### For Testers
1. Follow [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. Run automated tests: `./deploy.sh test`
3. Test manual scenarios
4. Verify in Adobe Acrobat
5. Check Solana Explorer

### For Architects
1. Read [DELIVERABLES.md](DELIVERABLES.md)
2. Review [docker-compose.yml](docker-compose.yml)
3. Study service architecture
4. Check security layers
5. Review blockchain integration

---

## File Purpose Summary

### Critical Files (Must Read)
| File | Purpose | Lines |
|------|---------|-------|
| [server.js](server.js) | Main API server with all routes | 450+ |
| [README.md](README.md) | Complete documentation | 600+ |
| [docker-compose.yml](docker-compose.yml) | Infrastructure definition | 60+ |

### Service Layer
| File | Purpose | Lines |
|------|---------|-------|
| [certificateService.js](services/certificateService.js) | Generate X.509 certs | 90+ |
| [pdfService.js](services/pdfService.js) | Visual stamps + P12 signing | 105+ |
| [solanaService.js](services/solanaService.js) | Blockchain anchoring | 155+ |

### Frontend Components
| File | Purpose | Lines |
|------|---------|-------|
| [App.jsx](frontend/src/App.jsx) | Main orchestrator | 150+ |
| [CreatorView.jsx](frontend/src/components/CreatorView.jsx) | Document creation form | 280+ |
| [ApproverView.jsx](frontend/src/components/ApproverView.jsx) | Signing dashboard | 220+ |
| [CompletedView.jsx](frontend/src/components/CompletedView.jsx) | Finalized docs | 200+ |

---

## Technology Stack Reference

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB 7.0 (Mongoose ODM)
- **PDF Processing**: pdf-lib, node-signpdf, node-forge
- **Blockchain**: @solana/web3.js
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Database**: MongoDB (Official Image)
- **Network**: Custom bridge network

### Blockchain
- **Network**: Solana Devnet
- **Program**: Memo Program (native)
- **Explorer**: https://explorer.solana.com

---

## Common Tasks Quick Reference

### Starting the System
```bash
# Unix/Linux/Mac
./deploy.sh start

# Windows
deploy.bat start

# Manual
docker-compose up --build
```

### Requesting Airdrop
```bash
# Using script
./deploy.sh airdrop

# Using curl
curl -X POST http://localhost:5000/request-airdrop \
  -H "Content-Type: application/json" \
  -d '{"amount": 2}'
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
./deploy.sh logs backend
```

### Checking Status
```bash
./deploy.sh status
curl http://localhost:5000/health
```

### Running Tests
```bash
./deploy.sh test
```

### Stopping the System
```bash
./deploy.sh stop
docker-compose down
```

### Cleaning Everything
```bash
./deploy.sh clean
docker-compose down -v
```

---

## API Endpoints Quick Reference

```
GET  /health                    - System health check
POST /request-airdrop           - Fund Solana wallet
GET  /wallet-info               - Wallet balance & address
POST /create-request            - Create new document request
GET  /requests                  - Get all requests
GET  /requests/:email           - Get user-specific requests
GET  /request/:id               - Get single request details
POST /sign-request              - Sign a document
GET  /download/:requestId       - Download final PDF
GET  /verify/:signature         - Verify blockchain transaction
GET  /uploads/:filename         - Static file serving
```

---

## Key Concepts

### The Three Security Layers

**Layer 1: Visual Signatures**
- File: [pdfService.js:9](services/pdfService.js:9) (`addVisualSignature`)
- Technology: pdf-lib
- Purpose: Human-readable stamps
- Viewable in: Any PDF viewer

**Layer 2: Cryptographic P12 Signature**
- File: [pdfService.js:58](services/pdfService.js:58) (`applyCryptographicSignature`)
- Technology: node-signpdf
- Purpose: Tamper detection
- Viewable in: Adobe Acrobat Reader

**Layer 3: Blockchain Anchoring**
- File: [solanaService.js:76](services/solanaService.js:76) (`anchorHashToBlockchain`)
- Technology: Solana Web3.js + Memo Program
- Purpose: Immutable audit trail
- Verifiable on: Solana Explorer

### The Signing Workflow

1. **Initiator (Alice)**: Creates request → Uploads PDF → Adds approvers with coordinates
2. **Approver 1 (Bob)**: Signs → Visual stamp added → Status: in-progress
3. **Approver 2 (Diana)**: Signs → Visual stamp → **Finalization**:
   - Apply P12 signature
   - Calculate SHA-256 hash
   - Anchor to Solana blockchain
   - Status: completed

**Implementation**: [server.js:288](server.js:288) (`POST /sign-request`)

---

## Environment Variables

### Backend (.env)
```env
PORT=5000                                           # API port
MONGODB_URI=mongodb://mongo:27017/chain_of_custody # Database
SOLANA_NETWORK=devnet                              # Blockchain network
NODE_ENV=production                                # Environment
```

### Frontend
```env
VITE_API_URL=http://localhost:5000                 # Backend URL
```

---

## Default Mock Users

| Name  | Email              | Role      |
|-------|--------------------|-----------|
| Alice | alice@example.com  | Initiator |
| Bob   | bob@example.com    | Approver  |
| Diana | diana@example.com  | Approver  |

---

## URLs & Ports

| Service  | URL                                    | Port  |
|----------|----------------------------------------|-------|
| Frontend | http://localhost:3000                  | 3000  |
| Backend  | http://localhost:5000                  | 5000  |
| MongoDB  | mongodb://localhost:27017              | 27017 |
| Health   | http://localhost:5000/health           | -     |
| Explorer | https://explorer.solana.com/?cluster=devnet | -     |

---

## Dependencies

### Backend (package.json)
```json
{
  "@solana/web3.js": "^1.95.0",
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "multer": "^1.4.5-lts.1",
  "pdf-lib": "^1.17.1",
  "node-signpdf": "^1.6.0",
  "node-forge": "^1.3.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend (frontend/package.json)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "vite": "^5.0.8",
  "tailwindcss": "^3.3.6"
}
```

---

## Troubleshooting Quick Links

### Common Issues
- **Insufficient balance**: [README.md](README.md) - Airdrop section
- **Can't see signature**: [README.md](README.md) - Adobe Acrobat section
- **Services won't start**: [QUICKSTART.md](QUICKSTART.md) - Troubleshooting
- **Port conflicts**: [README.md](README.md) - Prerequisites

### Logs & Debugging
- View all logs: `docker-compose logs -f`
- Backend logs: `docker-compose logs -f backend`
- MongoDB shell: `docker exec -it chain-custody-mongo mongosh`

---

## Production Deployment Checklist

- [ ] Replace self-signed cert with CA certificate
- [ ] Implement real authentication (JWT/OAuth)
- [ ] Use managed MongoDB with auth
- [ ] Add SSL/TLS certificates
- [ ] Implement rate limiting
- [ ] Use cloud storage (S3/GCS)
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Implement logging (ELK/Datadog)
- [ ] Use Solana mainnet (costs money!)
- [ ] Add backup strategy
- [ ] Security audit
- [ ] Load testing
- [ ] Error tracking (Sentry)
- [ ] API documentation (Swagger)

---

## Support Resources

### Internal Documentation
- **Getting Started**: [QUICKSTART.md](QUICKSTART.md)
- **Full Guide**: [README.md](README.md)
- **Architecture**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Testing**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Deliverables**: [DELIVERABLES.md](DELIVERABLES.md)

### External Resources
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [node-signpdf GitHub](https://github.com/vbuch/node-signpdf)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

## License

MIT License - See LICENSE file

---

## Version

**Version**: 1.0.0
**Release Date**: 2024
**Status**: Production-Ready PoC

---

## Contact & Feedback

For issues, questions, or feedback:
1. Check documentation first
2. Review [TESTING_GUIDE.md](TESTING_GUIDE.md)
3. Examine Docker logs
4. Verify all prerequisites

---

**Built with ❤️ for tamper-proof document signing with blockchain verification**

🔐 Secure • ⛓️ Immutable • 📝 Auditable
