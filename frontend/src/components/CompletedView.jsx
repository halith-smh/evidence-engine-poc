import React from 'react';

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
                  <svg className="w-6 h-6 text-indigo-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
                      className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      View on Solana Explorer →
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
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Download Final PDF
                </a>
                <a
                  href={`${API_BASE}/verify/${request.blockchainTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
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
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-gray-900 mb-1">Visual Stamps</h4>
            <p className="text-sm text-gray-600">
              Each signature is visually stamped at specific coordinates with timestamp
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🔐</div>
            <h4 className="font-semibold text-gray-900 mb-1">P12 Certificate</h4>
            <p className="text-sm text-gray-600">
              Cryptographic digital signature applied using X.509 certificate
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">⛓️</div>
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
