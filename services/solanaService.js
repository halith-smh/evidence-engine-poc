import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

const WALLET_PATH = './wallet.json';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

let connection;
let walletKeypair;

/**
 * Initialize Solana connection and wallet
 */
export function initializeSolana(network = 'devnet') {
  const endpoint = network === 'devnet'
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';

  connection = new Connection(endpoint, 'confirmed');

  // Load or generate wallet
  // Check if wallet file exists AND is a file (not a directory)
  if (fs.existsSync(WALLET_PATH) && fs.statSync(WALLET_PATH).isFile()) {
    console.log('📂 Loading existing Solana wallet...');
    const walletData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletData));
  } else {
    console.log('🔑 Generating new Solana wallet...');

    // If wallet.json exists as a directory, we can't use it
    if (fs.existsSync(WALLET_PATH) && fs.statSync(WALLET_PATH).isDirectory()) {
      console.log('⚠️  wallet.json exists as a directory (possibly Docker volume mount)');
      console.log('💡 Using alternative path: ./data/wallet.json');

      // Use alternative path inside a data directory
      const dataDir = './data';
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const altWalletPath = path.join(dataDir, 'wallet.json');

      // Check if wallet exists in alternative location
      if (fs.existsSync(altWalletPath) && fs.statSync(altWalletPath).isFile()) {
        console.log('📂 Loading wallet from alternative location...');
        const walletData = JSON.parse(fs.readFileSync(altWalletPath, 'utf-8'));
        walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletData));
      } else {
        // Generate new wallet in alternative location
        walletKeypair = Keypair.generate();
        fs.writeFileSync(
          altWalletPath,
          JSON.stringify(Array.from(walletKeypair.secretKey))
        );
        console.log('✅ New wallet saved to ./data/wallet.json');
        console.log('🎉 New wallet created - will request airdrop automatically...');
        // Set flag to request airdrop after initialization
        global.shouldRequestInitialAirdrop = true;
      }
    } else {
      // Normal case: generate wallet at default location
      walletKeypair = Keypair.generate();
      fs.writeFileSync(
        WALLET_PATH,
        JSON.stringify(Array.from(walletKeypair.secretKey))
      );
      console.log('✅ New wallet saved to wallet.json');
      console.log('🎉 New wallet created - will request airdrop automatically...');
      // Set flag to request airdrop after initialization
      global.shouldRequestInitialAirdrop = true;
    }
  }

  console.log(`✅ Solana initialized on ${network}`);
  console.log(`📍 Wallet Address: ${walletKeypair.publicKey.toBase58()}`);

  return {
    connection,
    walletAddress: walletKeypair.publicKey.toBase58()
  };
}

/**
 * Request airdrop of SOL tokens for devnet testing
 */
export async function requestAirdrop(amount = 2, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💰 Requesting ${amount} SOL airdrop (Attempt ${attempt}/${maxRetries})...`);

      const signature = await connection.requestAirdrop(
        walletKeypair.publicKey,
        amount * LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(signature);

      const balance = await connection.getBalance(walletKeypair.publicKey);
      console.log(`✅ Airdrop successful! New balance: ${balance / LAMPORTS_PER_SOL} SOL`);

      return {
        success: true,
        signature,
        balance: balance / LAMPORTS_PER_SOL
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Airdrop attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.error(`❌ All ${maxRetries} airdrop attempts failed`);
  throw lastError;
}

/**
 * Get current wallet balance
 */
export async function getWalletBalance() {
  const balance = await connection.getBalance(walletKeypair.publicKey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Anchor PDF hash to Solana blockchain using Memo Program
 * The Memo program stores arbitrary data on-chain
 */
export async function anchorHashToBlockchain(pdfHash, requestId, requestName) {
  try {
    console.log(`⛓️  Anchoring hash to Solana blockchain...`);
    console.log(`📄 Request: ${requestName} (ID: ${requestId})`);
    console.log(`🔐 Hash: ${pdfHash}`);

    // Check balance first
    const balance = await getWalletBalance();
    if (balance < 0.001) {
      throw new Error(`Insufficient balance: ${balance} SOL. Please request an airdrop first.`);
    }

    // Construct memo message with structured data
    const memoMessage = JSON.stringify({
      type: 'CHAIN_OF_CUSTODY',
      requestId,
      requestName,
      hash: pdfHash,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });

    // Create memo instruction
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoMessage, 'utf-8')
    });

    // Create and send transaction
    const transaction = new Transaction().add(memoInstruction);

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
      { commitment: 'confirmed' }
    );

    console.log(`✅ Hash anchored successfully!`);
    console.log(`🔗 Transaction Signature: ${signature}`);
    console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    return {
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Blockchain anchoring failed:', error);
    throw error;
  }
}

/**
 * Verify a transaction exists on the blockchain
 */
export async function verifyTransaction(signature) {
  try {
    console.log('🔍 Verifying transaction:', signature);

    // Fetch transaction with versioned transaction support
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      console.log('❌ Transaction not found on blockchain');
      return { verified: false, message: 'Transaction not found' };
    }

    console.log('✅ Transaction found, extracting memo data...');

    // Get account keys (handles both legacy and versioned transactions)
    const accountKeys = tx.transaction.message.getAccountKeys();
    const instructions = tx.transaction.message.compiledInstructions || tx.transaction.message.instructions;

    // Find memo instruction
    const memoInstruction = instructions.find((ix) => {
      // Get the program ID from account keys
      const programId = accountKeys.get(ix.programIdIndex);

      // Check if it's the memo program
      return programId && programId.equals(MEMO_PROGRAM_ID);
    });

    if (memoInstruction) {
      // Decode memo data
      const memoData = Buffer.from(memoInstruction.data).toString('utf-8');
      console.log('✅ Memo data found:', memoData);

      return {
        verified: true,
        data: JSON.parse(memoData),
        blockTime: tx.blockTime,
        slot: tx.slot,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    }

    console.log('❌ Memo data not found in transaction');
    return { verified: false, message: 'Memo data not found in transaction' };
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { verified: false, error: error.message };
  }
}

export function getWalletAddress() {
  return walletKeypair.publicKey.toBase58();
}
