import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import services
import { loadCertificate } from './services/certificateService.js';
import {
  addVisualSignature,
  applyCryptographicSignature,
  calculatePdfHash,
  areAllApproversSigned
} from './services/pdfService.js';
import {
  initializeSolana,
  requestAirdrop,
  anchorHashToBlockchain,
  getWalletBalance,
  getWalletAddress,
  verifyTransaction
} from './services/solanaService.js';

// Import models
import Request from './models/Request.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Global certificate storage
let certificateData = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ==================== STARTUP INITIALIZATION ====================

async function initializeServer() {
  console.log('\n🚀 Initializing Chain of Custody System...\n');

  try {
    // 1. Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 2. Load certificate (production CA cert or dev self-signed)
    certificateData = await loadCertificate();
    console.log('');

    // 3. Initialize Solana
    const solanaInfo = initializeSolana(process.env.SOLANA_NETWORK);
    console.log('');

    // 4. Check wallet balance
    const balance = await getWalletBalance();
    console.log(`💰 Current wallet balance: ${balance} SOL`);

    if (balance < 0.001) {
      console.log('⚠️  WARNING: Low balance! Use POST /request-airdrop to fund the wallet');
    }

    console.log('\n✅ Server initialization complete!\n');
    console.log('=' .repeat(60));
    console.log(`📍 Wallet Address: ${solanaInfo.walletAddress}`);
    console.log(`🌐 Network: ${process.env.SOLANA_NETWORK}`);
    console.log(`💰 Balance: ${balance} SOL`);
    console.log('=' .repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// ==================== ROUTES ====================

// Health check
app.get('/health', async (req, res) => {
  try {
    const balance = await getWalletBalance();
    const walletAddress = getWalletAddress();

    res.json({
      status: 'healthy',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      solana: {
        network: process.env.SOLANA_NETWORK,
        walletAddress,
        balance: `${balance} SOL`
      },
      certificate: certificateData ? 'loaded' : 'not loaded'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request SOL airdrop (Devnet only)
app.post('/request-airdrop', async (req, res) => {
  try {
    const { amount = 2 } = req.body;

    if (process.env.SOLANA_NETWORK !== 'devnet') {
      return res.status(400).json({
        error: 'Airdrops are only available on devnet'
      });
    }

    const result = await requestAirdrop(amount);

    res.json({
      success: true,
      message: `Airdrop of ${amount} SOL successful`,
      signature: result.signature,
      newBalance: result.balance,
      explorerUrl: `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Airdrop failed',
      message: error.message
    });
  }
});

// Get wallet info
app.get('/wallet-info', async (req, res) => {
  try {
    const balance = await getWalletBalance();
    const address = getWalletAddress();

    res.json({
      address,
      balance: `${balance} SOL`,
      network: process.env.SOLANA_NETWORK,
      explorerUrl: `https://explorer.solana.com/address/${address}?cluster=devnet`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new request
app.post('/create-request', upload.single('pdf'), async (req, res) => {
  try {
    const { name, category, initiator, approvers } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Parse approvers (sent as JSON string from frontend)
    const approversList = JSON.parse(approvers);

    // Validate approvers
    if (!approversList || !Array.isArray(approversList) || approversList.length === 0) {
      return res.status(400).json({ error: 'At least one approver is required' });
    }

    // Create request document
    const request = new Request({
      name,
      category,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      initiator,
      approvers: approversList.map(app => ({
        email: app.email,
        x: parseFloat(app.x),
        y: parseFloat(app.y),
        pageNumber: parseInt(app.pageNumber) || 0,
        signed: false
      })),
      status: 'pending',
      history: [{
        action: 'created',
        user: initiator,
        details: `Request created with ${approversList.length} approver(s)`
      }]
    });

    await request.save();

    res.json({
      success: true,
      message: 'Request created successfully',
      requestId: request._id,
      request
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      error: 'Failed to create request',
      message: error.message
    });
  }
});

// Get all requests
app.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests for specific user
app.get('/requests/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find requests where user is initiator or approver
    const requests = await Request.find({
      $or: [
        { initiator: email },
        { 'approvers.email': email }
      ]
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single request
app.get('/request/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign request
app.post('/sign-request', async (req, res) => {
  try {
    const { requestId, signerEmail } = req.body;

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find approver
    const approver = request.approvers.find(app => app.email === signerEmail);

    if (!approver) {
      return res.status(403).json({ error: 'User is not an approver for this request' });
    }

    if (approver.signed) {
      return res.status(400).json({ error: 'User has already signed this request' });
    }

    // Get PDF path
    const pdfPath = path.join(uploadsDir, request.filename);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Processing signature for request: ${request.name}`);
    console.log(`👤 Signer: ${signerEmail}`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Add visual signature
    await addVisualSignature(
      pdfPath,
      signerEmail,
      approver.x,
      approver.y,
      approver.pageNumber
    );

    // Update approver status
    approver.signed = true;
    approver.signedAt = new Date();

    // Add to history
    request.history.push({
      action: 'signed',
      user: signerEmail,
      details: `Document signed at coordinates (${approver.x}, ${approver.y})`
    });

    // Check if all approvers have signed
    const allSigned = areAllApproversSigned(request.approvers);

    if (allSigned) {
      console.log('\n🎉 All approvers have signed! Initiating finalization...\n');

      request.status = 'completed';
      request.completedAt = new Date();

      // Step 2: Apply cryptographic signature (P12)
      await applyCryptographicSignature(
        pdfPath,
        certificateData.p12Buffer,
        certificateData.password
      );

      // Step 3: Calculate hash of final PDF
      const pdfHash = await calculatePdfHash(pdfPath);
      request.finalPdfHash = pdfHash;

      // Step 4: Anchor to blockchain
      try {
        const blockchainResult = await anchorHashToBlockchain(
          pdfHash,
          request._id.toString(),
          request.name
        );

        request.blockchainTx = blockchainResult.signature;

        request.history.push({
          action: 'finalized',
          user: 'SYSTEM',
          details: `Document sealed and anchored to blockchain. TX: ${blockchainResult.signature}`
        });

        console.log(`\n✅ Request finalized successfully!`);
        console.log(`🔗 Blockchain TX: ${blockchainResult.signature}\n`);
      } catch (blockchainError) {
        console.error('❌ Blockchain anchoring failed:', blockchainError);
        request.history.push({
          action: 'error',
          user: 'SYSTEM',
          details: `Blockchain anchoring failed: ${blockchainError.message}`
        });
      }
    } else {
      request.status = 'in-progress';
    }

    await request.save();

    res.json({
      success: true,
      message: allSigned ? 'Document fully signed and finalized' : 'Signature added successfully',
      request,
      finalized: allSigned,
      blockchainTx: request.blockchainTx,
      explorerUrl: request.blockchainTx
        ? `https://explorer.solana.com/tx/${request.blockchainTx}?cluster=devnet`
        : null
    });
  } catch (error) {
    console.error('❌ Error signing request:', error);
    res.status(500).json({
      error: 'Failed to sign request',
      message: error.message
    });
  }
});

// Verify blockchain transaction
app.get('/verify/:signature', async (req, res) => {
  try {
    const result = await verifyTransaction(req.params.signature);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download PDF
app.get('/download/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const pdfPath = path.join(uploadsDir, request.filename);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(pdfPath, `${request.name}.pdf`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================

initializeServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /request-airdrop - Request SOL airdrop (devnet)`);
    console.log(`   GET  /wallet-info - Get wallet information`);
    console.log(`   POST /create-request - Create new request`);
    console.log(`   GET  /requests - Get all requests`);
    console.log(`   GET  /requests/:email - Get requests for user`);
    console.log(`   GET  /request/:id - Get single request`);
    console.log(`   POST /sign-request - Sign a request`);
    console.log(`   GET  /download/:requestId - Download PDF`);
    console.log(`   GET  /verify/:signature - Verify blockchain TX`);
    console.log('');
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
