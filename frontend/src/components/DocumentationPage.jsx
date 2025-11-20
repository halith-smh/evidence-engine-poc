import React, { useEffect } from 'react';
import mermaid from 'mermaid';

function DocumentationPage() {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
    mermaid.contentLoaded();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KTern Evidence Engine - PoC
        </h1>
        {/* <p className="text-lg text-gray-600 mb-8">
          A comprehensive guide to understanding the architecture, data models, and tamper-proof mechanisms
        </p> */}

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><a href="#overview" className="hover:underline">1. System Overview</a></li>
            <li><a href="#architecture" className="hover:underline">2. System Architecture</a></li>
            <li><a href="#database" className="hover:underline">3. Database Model Structure</a></li>
            <li><a href="#tamper-proof" className="hover:underline">4. Tamper-Proof Mechanism</a></li>
            <li><a href="#blockchain" className="hover:underline">5. Blockchain Storage</a></li>
            <li><a href="#workflows" className="hover:underline">6. Workflow Diagrams</a></li>
            <li><a href="#tech-stack" className="hover:underline">7. Technology Stack</a></li>
          </ol>
        </div>

        {/* 1. System Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            1. System Overview
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              The KTern Evidence Engine is a blockchain-anchored document signing and verification system
              that provides tamper-proof, auditable sign-off workflows with cryptographic guarantees.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-green-900 mb-3">Key Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Visual Signatures:</strong> Human-readable signature stamps at custom coordinates</li>
                <li><strong>Cryptographic Signatures:</strong> Industry-standard P12/PKCS#12 digital signatures</li>
                <li><strong>Blockchain Anchoring:</strong> Immutable hash storage on Solana blockchain</li>
                <li><strong>Complete Audit Trail:</strong> Timestamped history of all document actions</li>
                <li><strong>Public Verification:</strong> Anyone can verify documents without authentication</li>
                <li><strong>Tamper Detection:</strong> Immediate detection of any document modifications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. System Architecture */}
        <section id="architecture" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            2. System Architecture
          </h2>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">High-Level Architecture</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`graph TB
    subgraph Client["Client Layer"]
        UI[React Frontend]
    end

    subgraph Server["Application Layer"]
        API[Express.js REST API]
        PDF[PDF Service]
        SOL[Solana Service]
        VER[Verification Service]
    end

    subgraph Storage["Storage Layer"]
        DB[(MongoDB)]
        FS[File System]
    end

    subgraph Blockchain["Blockchain Layer"]
        SOLANA[Solana Devnet]
        MEMO[Memo Program]
    end

    UI -->|HTTP Requests| API
    API -->|CRUD Operations| DB
    API -->|Store/Read PDFs| FS
    API -->|Visual Signatures| PDF
    API -->|P12 Signing| PDF
    API -->|Anchor Hash| SOL
    API -->|Verify Document| VER
    SOL -->|Store Hash| MEMO
    MEMO -->|Immutable Record| SOLANA
    VER -->|Query Transaction| SOLANA
    VER -->|Cross-verify| DB

    style Client fill:#e3f2fd
    style Server fill:#fff3e0
    style Storage fill:#f3e5f5
    style Blockchain fill:#e8f5e9`}
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Component Architecture</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`graph LR
    subgraph Frontend["Frontend Components"]
        LOGIN[Login Switcher]
        CREATOR[Creator View]
        APPROVER[Approver View]
        VERIFY[Verification Portal]
        WALLET[Wallet Info]
    end

    subgraph Backend["Backend Services"]
        EXPRESS[Express Server]
        MULTER[Multer Upload]
        PDFLIB[PDF Processing]
        SIGN[P12 Signer]
        BLOCKCHAIN[Blockchain Service]
    end

    LOGIN --> EXPRESS
    CREATOR --> MULTER
    APPROVER --> PDFLIB
    VERIFY --> BLOCKCHAIN
    MULTER --> FS[File System]
    PDFLIB --> SIGN
    SIGN --> BLOCKCHAIN

    style Frontend fill:#bbdefb
    style Backend fill:#ffe0b2`}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h4 className="text-lg font-semibold text-yellow-900 mb-2">Architecture Principles</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Separation of Concerns:</strong> Clear separation between presentation, business logic, and data layers</li>
              <li><strong>Stateless API:</strong> RESTful endpoints with no server-side session management</li>
              <li><strong>Immutable Audit Trail:</strong> All actions are logged and cannot be modified</li>
              <li><strong>Decentralized Verification:</strong> Public blockchain enables trustless verification</li>
            </ul>
          </div>
        </section>

        {/* 3. Database Model Structure */}
        <section id="database" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            3. Database Model Structure
          </h2>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">MongoDB Schema</h3>
            <p className="text-gray-700 mb-4">
              The system uses MongoDB with Mongoose ODM. All data is stored in a single collection with embedded sub-documents.
            </p>

            <div className="mermaid">
              {`erDiagram
    Request ||--o{ Approver : contains
    Request ||--o{ HistoryEntry : contains

    Request {
        ObjectId _id PK
        string name
        string category
        string filename
        string originalFilename
        string initiator
        string status
        string blockchainTx
        string finalPdfHash
        date createdAt
        date completedAt
    }

    Approver {
        string email
        number x
        number y
        number pageNumber
        boolean signed
        date signedAt
    }

    HistoryEntry {
        string action
        string user
        date timestamp
        string details
    }`}
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h4 className="text-lg font-semibold text-gray-900">Request Schema Details</h4>
            </div>
            <div className="p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">name</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Request/Document name (required)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">category</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Document category (contract, agreement, invoice, etc.)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">filename</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Actual file path on server disk</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">initiator</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Email of the request creator</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">approvers[]</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Array</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Embedded approver sub-documents</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">status</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Enum</td>
                    <td className="px-4 py-2 text-sm text-gray-600">'pending', 'in-progress', or 'completed'</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">blockchainTx</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Solana transaction signature (null until anchored)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">finalPdfHash</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">SHA-256 hash of final signed PDF</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">history[]</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Array</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Audit trail of all actions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h4 className="text-lg font-semibold text-gray-900">Approver Sub-Schema</h4>
            </div>
            <div className="p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">email</td>
                    <td className="px-4 py-2 text-sm text-gray-600">String</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Approver's email address</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">x</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Number</td>
                    <td className="px-4 py-2 text-sm text-gray-600">X coordinate for signature placement</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">y</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Number</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Y coordinate for signature placement</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">pageNumber</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Number</td>
                    <td className="px-4 py-2 text-sm text-gray-600">PDF page number (0-indexed)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">signed</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Boolean</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Whether approver has signed</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">signedAt</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Date</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Timestamp of signature</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">Design Decisions</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Embedded Documents:</strong> Approvers and history are embedded (not referenced) for atomicity and consistency</li>
              <li><strong>Immutable History:</strong> History entries are append-only; never modified or deleted</li>
              <li><strong>Dual Hash Storage:</strong> Hash stored both in DB and blockchain for redundancy and verification</li>
              <li><strong>Status Tracking:</strong> Explicit status field enables efficient querying of pending/in-progress requests</li>
            </ul>
          </div>
        </section>

        {/* 4. Tamper-Proof Mechanism */}
        <section id="tamper-proof" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            4. Tamper-Proof Mechanism
          </h2>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-semibold text-red-900 mb-4">Three-Layer Security Model</h3>
            <p className="text-gray-700 mb-4">
              The system employs a multi-layered approach to ensure document integrity and detect tampering:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Layer 1: Visual Signatures</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Human-readable proof</li>
                <li>PDF-lib library</li>
                <li>Contains email + timestamp</li>
                <li>Visible in any PDF reader</li>
                <li>Custom X,Y coordinates</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Layer 2: P12 Signatures</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Cryptographic signatures</li>
                <li>PKCS#12 format</li>
                <li>X.509 certificates</li>
                <li>Adobe Acrobat compatible</li>
                <li>Non-repudiation guarantee</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">Layer 3: Blockchain</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Immutable hash storage</li>
                <li>Solana blockchain</li>
                <li>Public verification</li>
                <li>Decentralized validators</li>
                <li>Cryptographic timestamp</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tamper Detection Process</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`sequenceDiagram
    participant User
    participant API
    participant Hash as Hash Calculator
    participant BC as Blockchain
    participant DB as Database

    User->>API: Upload PDF for verification
    API->>Hash: Calculate SHA-256 hash
    Hash-->>API: Return hash
    API->>BC: Search for hash in transactions

    alt Hash NOT found on blockchain
        BC-->>API: Not found
        API-->>User: Status: NOT_FOUND<br/>Document never processed
    else Hash found on blockchain
        BC-->>API: Found with requestId
        API->>DB: Retrieve request by ID
        DB-->>API: Return request data
        API->>API: Compare hashes<br/>(uploaded vs stored)

        alt Hashes do NOT match
            API-->>User: Status: TAMPERED<br/>Hash mismatch detected!
        else Hashes match
            API->>API: Extract signatures<br/>Build chain of custody<br/>Calculate trust level
            API-->>User: Status: VERIFIED<br/>Trust Level: HIGH<br/>Complete evidence
        end
    end`}
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h4 className="text-lg font-semibold text-gray-900">Hash-Based Integrity Verification</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">What is SHA-256?</h5>
                  <p className="text-gray-700">
                    SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function that:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>Produces a unique 256-bit (64 character hex) fingerprint for any input</li>
                    <li>Is deterministic - same input always produces same hash</li>
                    <li>Is collision-resistant - virtually impossible to find two different inputs with same hash</li>
                    <li>Is one-way - cannot reverse hash to get original input</li>
                    <li>Has avalanche effect - tiny change in input completely changes hash</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">Example: Tamper Detection</h5>
                  <div className="font-mono text-xs space-y-2">
                    <div>
                      <strong>Original PDF Hash:</strong><br />
                      <code className="text-green-700">a1b2c3d4e5f6... (stored on blockchain)</code>
                    </div>
                    <div>
                      <strong>Modified PDF Hash:</strong><br />
                      <code className="text-red-700">z9y8x7w6v5u4... (completely different!)</code>
                    </div>
                    <div>
                      <strong>Result:</strong> <span className="text-red-700 font-bold">TAMPERED - Immediate Detection</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Why This Is Tamper-Proof</h5>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li><strong>Blockchain Immutability:</strong> Once written to Solana, the hash cannot be altered by anyone</li>
                    <li><strong>Multiple Verification Points:</strong> Hash exists in 3 places (DB, blockchain, uploaded file) - all must match</li>
                    <li><strong>Decentralized Trust:</strong> Thousands of independent Solana validators maintain the record</li>
                    <li><strong>Mathematical Certainty:</strong> Any modification, even changing a single bit, produces a completely different hash</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-900 mb-2">Trust Level Calculation</h4>
            <p className="text-gray-700 mb-3">The system calculates a trust level score (0-100) based on multiple factors:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>+30 points:</strong> Hash matches stored hash</li>
              <li><strong>+30 points:</strong> Found on blockchain</li>
              <li><strong>+20 points:</strong> P12 signature valid</li>
              <li><strong>+10 points:</strong> All approvers signed</li>
              <li><strong>+10 points:</strong> Visual signatures found</li>
              <li className="mt-2 pt-2 border-t border-red-200"><strong>HIGH (80-100):</strong> Fully verified and trustworthy</li>
              <li><strong>MEDIUM (50-79):</strong> Partially verified, some evidence missing</li>
              <li><strong>LOW (&lt;50):</strong> Insufficient verification evidence</li>
            </ul>
          </div>
        </section>

        {/* 5. Blockchain Storage */}
        <section id="blockchain" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            5. Blockchain Storage Implementation
          </h2>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-semibold text-purple-900 mb-4">Why Solana?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Technical Advantages</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>High throughput (65,000 TPS)</li>
                  <li>Low transaction fees (~$0.00025)</li>
                  <li>Fast finality (~400ms)</li>
                  <li>Built-in Memo program</li>
                  <li>Robust RPC infrastructure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Business Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Cost-effective for high volume</li>
                  <li>Near-instant confirmations</li>
                  <li>Public verification via Explorer</li>
                  <li>Active developer ecosystem</li>
                  <li>Production-ready infrastructure</li>
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Data Structure on Blockchain</h3>
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h4 className="text-lg font-semibold text-gray-900">Memo Transaction Format</h4>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                The system uses Solana's Memo Program to store structured JSON data on-chain:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {`{
  "type": "CHAIN_OF_CUSTODY",
  "requestId": "507f1f77bcf86cd799439011",
  "requestName": "Q4 Financial Report",
  "hash": "a1b2c3d4e5f6789...",
  "timestamp": "2025-11-20T10:30:45.123Z",
  "version": "1.0"
}`}
              </pre>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>type:</strong> Identifies this as a chain of custody record</p>
                <p><strong>requestId:</strong> MongoDB document ID for cross-reference</p>
                <p><strong>requestName:</strong> Human-readable document name</p>
                <p><strong>hash:</strong> SHA-256 hash of the final signed PDF (64 hex characters)</p>
                <p><strong>timestamp:</strong> ISO 8601 timestamp when anchored</p>
                <p><strong>version:</strong> Schema version for future compatibility</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Blockchain Anchoring Process</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`sequenceDiagram
    participant PDF as PDF Service
    participant API as Express API
    participant SOL as Solana Service
    participant BC as Solana Blockchain
    participant DB as MongoDB

    Note over PDF,DB: Triggered when all approvers sign

    PDF->>PDF: Apply P12 signature
    PDF->>PDF: Calculate SHA-256 hash
    PDF-->>API: Return signed PDF + hash

    API->>SOL: anchorHashToBlockchain(requestId, hash)
    SOL->>SOL: Check wallet balance
    SOL->>SOL: Create memo JSON
    SOL->>BC: Send transaction with memo
    BC->>BC: Validate transaction
    BC->>BC: Include in block
    BC-->>SOL: Return transaction signature
    SOL-->>API: Return tx signature + explorer URL

    API->>DB: Update request:<br/>- blockchainTx = signature<br/>- finalPdfHash = hash<br/>- status = 'completed'
    DB-->>API: Update confirmed

    API-->>PDF: Anchoring complete`}
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h4 className="text-lg font-semibold text-gray-900">What Gets Stored Where</h4>
            </div>
            <div className="p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Blockchain</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Database</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">PDF Document</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">SHA-256 Hash</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">Transaction Signature</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">Request Metadata</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓ (partial)</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓ (complete)</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">Approvers</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">History/Audit Trail</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">Timestamp</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓ (blockTime)</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600">✓</td>
                    <td className="px-4 py-2 text-sm text-center">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Privacy & Efficiency</h4>
            <p className="text-gray-700 mb-3">
              The system stores only the hash on-chain, NOT the document itself. This provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Privacy:</strong> Document contents remain confidential; only the hash is public</li>
              <li><strong>Efficiency:</strong> Tiny data footprint on blockchain (few hundred bytes vs megabytes)</li>
              <li><strong>Cost Savings:</strong> Minimal transaction fees due to small data size</li>
              <li><strong>Scalability:</strong> Can handle thousands of documents without blockchain bloat</li>
              <li><strong>Verification:</strong> Anyone with the original document can independently verify its authenticity</li>
            </ul>
          </div>
        </section>

        {/* 6. Workflow Diagrams */}
        <section id="workflows" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            6. Complete Workflow Diagrams
          </h2>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Request Creation Workflow</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`flowchart TD
    Start([User: Create Request]) --> Upload[Upload PDF + Enter Details]
    Upload --> AddApprovers[Add Approvers with Coordinates]
    AddApprovers --> Validate{Validation}

    Validate -->|Invalid| Error1[Show Error Message]
    Error1 --> Upload

    Validate -->|Valid| Submit[Submit to API]
    Submit --> SaveFile[Save PDF to File System]
    SaveFile --> CreateDB[Create MongoDB Document]
    CreateDB --> History1[Add 'created' to history]
    History1 --> Response[Return Request ID]
    Response --> End([Request Created: Status = 'pending'])

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style Error1 fill:#ffcdd2`}
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Signing Workflow</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`flowchart TD
    Start([Approver: Click Sign]) --> Validate{Validations}

    Validate -->|Not an approver| Error1[Error: Unauthorized]
    Validate -->|Already signed| Error2[Error: Already signed]
    Validate -->|PDF missing| Error3[Error: File not found]

    Validate -->|All Valid| AddVisual[Add Visual Signature to PDF]
    AddVisual --> UpdateDB[Update approver.signed = true]
    UpdateDB --> History[Add 'signed' to history]
    History --> CheckAll{All Approvers<br/>Signed?}

    CheckAll -->|No| StatusProgress[status = 'in-progress']
    StatusProgress --> End1([Save & Return])

    CheckAll -->|Yes| Finalize[Start Finalization]
    Finalize --> P12[Apply P12 Signature]
    P12 --> CalcHash[Calculate SHA-256 Hash]
    CalcHash --> Blockchain[Anchor to Solana]
    Blockchain --> UpdateFinal[Update: blockchainTx,<br/>finalPdfHash,<br/>status = 'completed']
    UpdateFinal --> HistoryFinal[Add 'finalized' to history]
    HistoryFinal --> End2([Document Complete])

    style Start fill:#e3f2fd
    style End1 fill:#fff9c4
    style End2 fill:#c8e6c9
    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
    style Error3 fill:#ffcdd2
    style Finalize fill:#e1bee7`}
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Verification Workflow</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`flowchart TD
    Start([User: Upload PDF]) --> CalcHash[Calculate SHA-256 Hash]
    CalcHash --> SearchBC{Search Blockchain<br/>for Hash}

    SearchBC -->|Not Found| Result1[Status: NOT_FOUND<br/>Never processed or modified]

    SearchBC -->|Found| GetRequest[Retrieve Request from DB<br/>using requestId]
    GetRequest --> CompareHash{Hash Match?}

    CompareHash -->|No Match| Result2[Status: TAMPERED<br/>Hash mismatch!]

    CompareHash -->|Match| Extract[Extract Metadata]
    Extract --> P12Check[Validate P12 Signature]
    P12Check --> VisualCheck[Extract Visual Signatures]
    VisualCheck --> BuildChain[Build Chain of Custody]
    BuildChain --> BuildTimeline[Build Timeline from History]
    BuildTimeline --> CalcTrust[Calculate Trust Level]
    CalcTrust --> Result3[Status: VERIFIED<br/>Trust: HIGH<br/>Complete Evidence]

    Result1 --> End([Return Result])
    Result2 --> End
    Result3 --> End

    style Start fill:#e3f2fd
    style Result1 fill:#fff9c4
    style Result2 fill:#ffcdd2
    style Result3 fill:#c8e6c9
    style End fill:#e0e0e0`}
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Complete System State Machine</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mermaid">
              {`stateDiagram-v2
    [*] --> Pending: Request Created

    Pending --> InProgress: First Approver Signs
    InProgress --> InProgress: More Approvers Sign
    InProgress --> Completed: Last Approver Signs<br/>(triggers finalization)

    Completed --> [*]: Anchored to Blockchain

    note right of Pending
        No approvers have signed yet
        blockchainTx = null
        finalPdfHash = null
    end note

    note right of InProgress
        Some approvers signed
        blockchainTx = null
        finalPdfHash = null
    end note

    note right of Completed
        All approvers signed
        P12 signature applied
        Hash anchored on blockchain
        blockchainTx = signature
        finalPdfHash = hash
    end note`}
            </div>
          </div>
        </section>

        {/* 7. Technology Stack */}
        <section id="tech-stack" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
            7. Technology Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Frontend Stack</h3>
              <table className="w-full text-sm">
                <tbody className="space-y-2">
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Framework</td>
                    <td className="text-gray-600">React 18</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Styling</td>
                    <td className="text-gray-600">Tailwind CSS</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">HTTP Client</td>
                    <td className="text-gray-600">Axios</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Icons</td>
                    <td className="text-gray-600">Lucide React</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Build Tool</td>
                    <td className="text-gray-600">Vite</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Diagrams</td>
                    <td className="text-gray-600">Mermaid.js</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Backend Stack</h3>
              <table className="w-full text-sm">
                <tbody className="space-y-2">
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Runtime</td>
                    <td className="text-gray-600">Node.js</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Framework</td>
                    <td className="text-gray-600">Express.js</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Database</td>
                    <td className="text-gray-600">MongoDB + Mongoose</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">File Upload</td>
                    <td className="text-gray-600">Multer</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">CORS</td>
                    <td className="text-gray-600">cors middleware</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Logging</td>
                    <td className="text-gray-600">Chalk</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">PDF Processing</h3>
              <table className="w-full text-sm">
                <tbody className="space-y-2">
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">PDF Library</td>
                    <td className="text-gray-600">pdf-lib</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Signing</td>
                    <td className="text-gray-600">@signpdf/signpdf</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">P12 Signer</td>
                    <td className="text-gray-600">@signpdf/signer-p12</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Placeholder</td>
                    <td className="text-gray-600">@signpdf/placeholder-pdfkit010</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Certificates</td>
                    <td className="text-gray-600">node-forge</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">PDFKit</td>
                    <td className="text-gray-600">pdfkit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">Blockchain</h3>
              <table className="w-full text-sm">
                <tbody className="space-y-2">
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Blockchain</td>
                    <td className="text-gray-600">Solana Devnet</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">SDK</td>
                    <td className="text-gray-600">@solana/web3.js</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Program</td>
                    <td className="text-gray-600">Memo Program</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Network</td>
                    <td className="text-gray-600">Devnet (configurable)</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-700 py-2">Hashing</td>
                    <td className="text-gray-600">crypto (SHA-256)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Dependencies Graph</h3>
            <div className="mermaid">
              {`graph LR
    subgraph Frontend
        React --> TailwindCSS
        React --> Axios
        React --> Lucide
        React --> Mermaid
    end

    subgraph Backend
        Express --> Mongoose
        Express --> Multer
        Express --> CORS
        Express --> PDFService
        Express --> SolanaService
    end

    subgraph PDF["PDF Processing"]
        PDFService --> PDFLib[pdf-lib]
        PDFService --> SignPDF[@signpdf]
        PDFService --> Forge[node-forge]
    end

    subgraph Blockchain
        SolanaService --> SolanaWeb3[@solana/web3.js]
        SolanaService --> Crypto[crypto SHA-256]
    end

    subgraph Storage
        Mongoose --> MongoDB[(MongoDB)]
        Multer --> FileSystem[File System]
    end

    Frontend -->|HTTP| Backend
    SolanaWeb3 -->|RPC| SolanaDevnet[Solana Devnet]

    style Frontend fill:#e3f2fd
    style Backend fill:#fff3e0
    style PDF fill:#f3e5f5
    style Blockchain fill:#e8f5e9
    style Storage fill:#fce4ec`}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Resources</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Solana Explorer:</strong> View transactions at <code className="bg-gray-200 px-2 py-1 rounded">https://explorer.solana.com/?cluster=devnet</code></li>
            <li>• <strong>GitHub Repository:</strong> View transactions at <code className="bg-gray-200 px-2 py-1 rounded">https://github.com/halith-smh/evidence-engine-poc</code></li>
            {/* <li>• <strong>GitHub Repository:</strong> Source code and deployment instructions</li>
            <li>• <strong>API Documentation:</strong> RESTful endpoint specifications</li>
            <li>• <strong>Support:</strong> Contact the KTern team for technical assistance</li> */}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocumentationPage;
