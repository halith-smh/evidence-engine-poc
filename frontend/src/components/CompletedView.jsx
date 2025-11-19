import React from 'react';
import { Download, Shield, ExternalLink, FileCheck, Lock, Link2, FileText } from 'lucide-react';

const API_BASE = '/api';

function CompletedView({ completedRequests, currentUser }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Completed & Blockchain-Anchored Documents
      </h2>

      {completedRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No completed documents yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {request.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Initiated by: {request.initiator}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed: {formatDate(request.completedAt)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  FINALIZED
                </span>
              </div>

              {/* Blockchain Info */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4 border border-indigo-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-indigo-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-900 mb-2">
                      Blockchain Verified
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Transaction:</span>
                        <code className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 font-mono">
                          {request.blockchainTx}
                        </code>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">PDF Hash:</span>
                        <code className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 font-mono">
                          {request.finalPdfHash}
                        </code>
                      </div>
                    </div>
                    <a
                      href={`https://explorer.solana.com/tx/${request.blockchainTx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      View on Solana Explorer
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Signature Timeline */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Signature Timeline
                </h4>
                <div className="space-y-2">
                  {request.approvers.map((approver, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-sm">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{approver.email}</p>
                        <p className="text-xs text-gray-500">
                          Signed at ({approver.x}, {approver.y}) on page {approver.pageNumber} • {formatDate(approver.signedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download & Verification Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Verification Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Download the final PDF document</li>
                  <li>2. Open it in Adobe Acrobat Reader (not browser)</li>
                  <li>3. You will see visual signature stamps and a cryptographic signature panel</li>
                  <li>4. Click the signature panel to view certificate details</li>
                  <li>5. Note: Self-signed certificates will show a warning - this is expected for the PoC</li>
                  <li>6. Verify the blockchain transaction on Solana Explorer to confirm immutability</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <a
                  href={`${API_BASE}/download/${request._id}`}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Final PDF
                </a>
                <a
                  href={`${API_BASE}/verify/${request.blockchainTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Shield size={16} />
                  Verify Transaction
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Understanding the Security Layers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Visual Stamps</h4>
            <p className="text-sm text-gray-600">
              Each signature is visually stamped at specific coordinates with timestamp
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="mb-2">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">P12 Certificate</h4>
            <p className="text-sm text-gray-600">
              Cryptographic digital signature applied using X.509 certificate
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="mb-2">
              <Link2 className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Blockchain Anchor</h4>
            <p className="text-sm text-gray-600">
              SHA-256 hash permanently recorded on Solana for tamper-proof verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletedView;
