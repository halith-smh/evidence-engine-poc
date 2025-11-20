import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import logger
import logger from './utils/logger.js';

// Import services
import { loadCertificate } from './services/certificateService.js';
import { verifyDocument } from './services/verificationService.js';
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

// Serve uploaded files (no /api prefix for file serving)
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
  logger.header('Initializing KTern Evidence Engine');

  try {
    // 1. Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.success('MongoDB connected');

    // 2. Load certificate (production CA cert or dev self-signed)
    certificateData = await loadCertificate();

    // 3. Initialize Solana
    const solanaInfo = initializeSolana(process.env.SOLANA_NETWORK);

    // 4. Check wallet balance
    let balance = await getWalletBalance();
    logger.info(`Current wallet balance: ${balance} SOL`);

    // 5. Auto-request airdrop for new wallets
    if (global.shouldRequestInitialAirdrop && balance < 0.001) {
      logger.info('🚀 Automatically requesting airdrop for new wallet...');
      try {
        const airdropResult = await requestAirdrop(2);
        balance = airdropResult.balance;
        logger.success(`✅ Initial airdrop successful! Balance: ${balance} SOL`);
        delete global.shouldRequestInitialAirdrop; // Clear the flag
      } catch (error) {
        logger.warn(`⚠️  Initial airdrop failed: ${error.message}`);
        logger.info('💡 You can manually request airdrop via the UI or POST /api/request-airdrop');
      }
    } else if (balance < 0.001) {
      logger.warn('WARNING: Low balance! Use POST /api/request-airdrop to fund the wallet');
    }

    logger.success('Server initialization complete!');
    logger.separator();
    logger.info(`Wallet Address: ${solanaInfo.walletAddress}`);
    logger.info(`Network: ${process.env.SOLANA_NETWORK}`);
    logger.info(`Balance: ${balance} SOL`);
    logger.separator();
  } catch (error) {
    logger.error('Initialization failed:', error);
    process.exit(1);
  }
}

// ==================== ROUTES ====================

// Create API router
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', async (req, res) => {
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
apiRouter.post('/request-airdrop', async (req, res) => {
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
apiRouter.get('/wallet-info', async (req, res) => {
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
apiRouter.post('/create-request', upload.single('pdf'), async (req, res) => {
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
    logger.error('Error creating request:', error.message);
    res.status(500).json({
      error: 'Failed to create request',
      message: error.message
    });
  }
});

// Get all requests
apiRouter.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests for specific user
apiRouter.get('/requests/:email', async (req, res) => {
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
apiRouter.get('/request/:id', async (req, res) => {
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
apiRouter.post('/sign-request', async (req, res) => {
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

    logger.separator();
    logger.info(`Processing signature for request: ${request.name}`);
    logger.info(`Signer: ${signerEmail}`);
    logger.separator();

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
      logger.success('All approvers have signed! Initiating finalization...');

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

        logger.success('Request finalized successfully!');
        logger.info(`Blockchain TX: ${blockchainResult.signature}`);
      } catch (blockchainError) {
        logger.error('Blockchain anchoring failed:', blockchainError.message);
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
    logger.error('Error signing request:', error.message);
    res.status(500).json({
      error: 'Failed to sign request',
      message: error.message
    });
  }
});

// Verify blockchain transaction
apiRouter.get('/verify/:signature', async (req, res) => {
  try {
    const result = await verifyTransaction(req.params.signature);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify document authenticity (upload PDF for verification)
apiRouter.post('/verify-document', upload.single('pdf'), async (req, res) => {
  logger.separator();
  logger.info('Document verification request received');
  logger.separator();

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a PDF file'
      });
    }

    logger.info(`File: ${req.file.originalname}`);
    logger.info(`Size: ${req.file.size} bytes`);

    // Read file into buffer (in-memory processing)
    const pdfBuffer = fs.readFileSync(req.file.path);

    // Delete the temporary file immediately
    fs.unlinkSync(req.file.path);
    logger.debug('Temporary file deleted (in-memory processing)');

    // Verify document (async, non-blocking)
    const verificationResult = await verifyDocument(pdfBuffer);

    logger.success(`Verification complete: ${verificationResult.status}`);
    logger.separator();

    // Return result
    res.json(verificationResult);

  } catch (error) {
    logger.error('Verification error:', error.message);

    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Download PDF
apiRouter.get('/download/:requestId', async (req, res) => {
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

// Mount API router
app.use('/api', apiRouter);

// ==================== START SERVER ====================

initializeServer().then(() => {
  app.listen(PORT, () => {
    logger.separator();
    logger.success(`Server running on http://localhost:${PORT}`);
    logger.info('API Documentation:');
    logger.info('  GET  /api/health - Health check');
    logger.info('  POST /api/request-airdrop - Request SOL airdrop (devnet)');
    logger.info('  GET  /api/wallet-info - Get wallet information');
    logger.info('  POST /api/create-request - Create new request');
    logger.info('  GET  /api/requests - Get all requests');
    logger.info('  GET  /api/requests/:email - Get requests for user');
    logger.info('  GET  /api/request/:id - Get single request');
    logger.info('  POST /api/sign-request - Sign a request');
    logger.info('  GET  /api/download/:requestId - Download PDF');
    logger.info('  GET  /api/verify/:signature - Verify blockchain TX');
    logger.info('  POST /api/verify-document - Verify document authenticity');
    logger.separator();
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.warn('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
