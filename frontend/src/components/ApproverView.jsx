import React, { useState } from 'react';
import axios from 'axios';
import { Check, Clock, Eye, FileSignature } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const UPLOADS_BASE = 'http://localhost:5000/uploads';

function ApproverView({ currentUser, pendingApprovals, myInitiatedRequests, onRefresh }) {
  const [signingRequestId, setSigningRequestId] = useState(null);

  const handleSign = async (requestId) => {
    if (!confirm('Are you sure you want to sign this document? This action cannot be undone.')) {
      return;
    }

    setSigningRequestId(requestId);

    try {
      const response = await axios.post(`${API_BASE}/sign-request`, {
        requestId,
        signerEmail: currentUser.email
      });

      if (response.data.finalized) {
        alert(
          `Document signed and finalized!\n\n` +
          `The document has been cryptographically sealed and anchored to the blockchain.\n\n` +
          `Transaction: ${response.data.blockchainTx}\n\n` +
          `You can verify this on Solana Explorer.`
        );
      } else {
        alert('Your signature has been added successfully!');
      }

      onRefresh();
    } catch (error) {
      alert(`Failed to sign: ${error.response?.data?.message || error.message}`);
    } finally {
      setSigningRequestId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Pending Approvals */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pending Signature ({pendingApprovals.length})
        </h2>

        {pendingApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((request) => {
              const myApprover = request.approvers.find(app => app.email === currentUser.email);
              const signedCount = request.approvers.filter(app => app.signed).length;
              const totalCount = request.approvers.length;

              return (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Initiated by: {request.initiator} | Created: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="font-medium">{signedCount} of {totalCount} signatures</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Your Signature Position:
                    </p>
                    <p className="text-sm text-gray-600">
                      Page {myApprover.pageNumber} at coordinates ({myApprover.x}, {myApprover.y})
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <a
                      href={`${UPLOADS_BASE}/${request.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Document
                    </a>
                    <button
                      onClick={() => handleSign(request._id)}
                      disabled={signingRequestId === request._id}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FileSignature size={16} />
                      {signingRequestId === request._id ? 'Signing...' : 'Sign Document'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Initiated Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          My Initiated Requests ({myInitiatedRequests.length})
        </h2>

        {myInitiatedRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">You haven't created any requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myInitiatedRequests.map((request) => {
              const signedCount = request.approvers.filter(app => app.signed).length;
              const totalCount = request.approvers.length;

              return (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Created: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Approval Progress: {signedCount} / {totalCount}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(signedCount / totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {request.approvers.map((approver, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{approver.email}</span>
                        {approver.signed ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Check size={14} />
                            Signed {approver.signedAt ? `on ${formatDate(approver.signedAt)}` : ''}
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium flex items-center gap-1">
                            <Clock size={14} />
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={`${UPLOADS_BASE}/${request.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Document
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApproverView;
