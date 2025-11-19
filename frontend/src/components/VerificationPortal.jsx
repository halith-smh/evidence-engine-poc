import { useState } from 'react';
import { Search, FileText, CheckCircle, XCircle, AlertTriangle, Shield, Link2, Lock, FileCheck, Clock } from 'lucide-react';

export default function VerificationPortal() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/verify-document', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Search className="w-8 h-8" />
          Document Verification Portal
        </h1>
        <p className="text-gray-600 mb-6">
          Verify the authenticity of KTern Evidence signed documents
        </p>

        {!result ? (
          <>
            {/* Upload Section */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
                file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="mb-4 flex justify-center">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                {file ? (
                  <>
                    <p className="text-lg font-semibold text-green-700 mb-2 flex items-center justify-center gap-2">
                      <CheckCircle size={20} />
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      Drop PDF here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported: PDF files up to 50MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 flex items-center gap-2">
                  <XCircle size={16} />
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={!file || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
                !file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search size={20} />
                  Verify Document
                </span>
              )}
            </button>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1️⃣ Upload your signed PDF</li>
                <li>2️⃣ We calculate its cryptographic hash</li>
                <li>3️⃣ We search the blockchain for this document</li>
                <li>4️⃣ You get instant verification report</li>
              </ol>
              <p className="mt-4 text-xs text-gray-600">
                🔒 Your file is processed in-memory and never stored on our servers
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Verification Results */}
            <VerificationResults result={result} onReset={resetForm} />
          </>
        )}
      </div>
    </div>
  );
}

function VerificationResults({ result, onReset }) {
  const isVerified = result.verified && result.status === 'VERIFIED';
  const isNotFound = result.status === 'NOT_FOUND';
  const isTampered = result.status === 'TAMPERED';

  return (
    <div>
      {/* Status Header */}
      <div
        className={`rounded-lg p-6 mb-6 ${
          isVerified
            ? 'bg-green-50 border-2 border-green-500'
            : 'bg-red-50 border-2 border-red-500'
        }`}
      >
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isVerified ? 'text-green-700' : 'text-red-700'}`}>
          {isVerified && <><CheckCircle size={28} /> DOCUMENT VERIFIED</>}
          {isNotFound && <><XCircle size={28} /> DOCUMENT NOT FOUND</>}
          {isTampered && <><AlertTriangle size={28} /> TAMPERING DETECTED</>}
          {!isVerified && !isNotFound && !isTampered && <><AlertTriangle size={28} /> {result.status}</>}
        </h2>
        <p className={`mt-2 ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
          {isVerified && 'This document is authentic and has not been modified'}
          {isNotFound && 'This document was not found in our system or has been modified'}
          {isTampered && 'This document has been modified after signing'}
        </p>
      </div>

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Issues Found:</h3>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {result.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Warnings:</h3>
          <ul className="list-disc list-inside text-yellow-700 text-sm">
            {result.warnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Info */}
      {result.document && result.document.hash && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText size={18} />
            Document Information
          </h3>
          <div className="space-y-2 text-sm">
            {result.document.name && (
              <div>
                <span className="font-medium">Name:</span> {result.document.name}
              </div>
            )}
            {result.document.category && (
              <div>
                <span className="font-medium">Category:</span> {result.document.category}
              </div>
            )}
            <div>
              <span className="font-medium">Hash:</span>
              <code className="ml-2 text-xs bg-white px-2 py-1 rounded">
                {result.document.hash.substring(0, 32)}...
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Info */}
      {result.blockchain && result.blockchain.found && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Link2 size={18} />
            Blockchain Verification
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 font-bold mr-2" size={16} />
              <span>Document found on Solana {result.blockchain.network}</span>
            </div>
            <div>
              <span className="font-medium">Transaction:</span>
              <code className="ml-2 text-xs bg-white px-2 py-1 rounded">
                {result.blockchain.signature?.substring(0, 20)}...
              </code>
            </div>
            {result.blockchain.blockTime && (
              <div>
                <span className="font-medium">Block Time:</span>{' '}
                {new Date(result.blockchain.blockTime * 1000).toLocaleString()}
              </div>
            )}
            {result.blockchain.explorerUrl && (
              <a
                href={result.blockchain.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-block mt-2"
              >
                View on Solana Explorer →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Cryptographic Signature */}
      {result.cryptographicSignature && result.cryptographicSignature.found && (
        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lock size={18} />
            Cryptographic Signature
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              {result.cryptographicSignature.valid ? (
                <CheckCircle className="text-green-600 font-bold mr-2" size={16} />
              ) : (
                <XCircle className="text-red-600 font-bold mr-2" size={16} />
              )}
              <span>
                P12 Digital Signature {result.cryptographicSignature.valid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            {result.cryptographicSignature.signer && (
              <div>
                <span className="font-medium">Signed By:</span> {result.cryptographicSignature.signer}
              </div>
            )}
            {result.cryptographicSignature.signedAt && (
              <div>
                <span className="font-medium">Signed At:</span>{' '}
                {new Date(result.cryptographicSignature.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KTern Evidence */}
      {result.chainOfCustody && result.chainOfCustody.approvers && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileCheck size={18} />
            KTern Evidence
          </h3>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Initiated by:</span>{' '}
              {result.chainOfCustody.initiator}
            </div>
            <div>
              <span className="font-medium text-sm">Approvers:</span>
              <ul className="mt-2 space-y-2">
                {result.chainOfCustody.approvers.map((approver, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm bg-white p-3 rounded"
                  >
                    {approver.signed ? (
                      <CheckCircle className="text-green-600 font-bold mr-2" size={16} />
                    ) : (
                      <Clock className="text-gray-400 font-bold mr-2" size={16} />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{approver.email}</div>
                      {approver.signedAt && (
                        <div className="text-xs text-gray-600">
                          {new Date(approver.signedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {result.timeline && result.timeline.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">📊 Timeline</h3>
          <div className="space-y-2">
            {result.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start text-sm">
                <span className="mr-3 text-gray-400">{idx + 1}.</span>
                <div className="flex-1">
                  <div className="font-medium">{event.action}</div>
                  {event.user && <div className="text-gray-600">by {event.user}</div>}
                  <div className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Level */}
      {result.trustLevel && (
        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
          <span className="font-semibold">Trust Level: </span>
          <span
            className={`font-bold text-lg ${
              result.trustLevel === 'HIGH'
                ? 'text-green-600'
                : result.trustLevel === 'MEDIUM'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {result.trustLevel}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Verify Another Document
        </button>
      </div>

      {/* Timestamp */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Verification performed at {new Date(result.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
